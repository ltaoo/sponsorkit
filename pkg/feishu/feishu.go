package feishu

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"sponsorkit/pkg/model"
	"time"

	lark "github.com/larksuite/oapi-sdk-go/v3"
	larkbitable "github.com/larksuite/oapi-sdk-go/v3/service/bitable/v1"
)

// GetTableRecords fetches all records from a Feishu Bitable table
func GetTableRecords(client *lark.Client, baseToken, tableID, viewID, sort string) ([]map[string]interface{}, error) {
	var records []map[string]interface{}
	var pageToken string
	hasMore := true

	for hasMore {
		reqBuilder := larkbitable.NewListAppTableRecordReqBuilder().
			AppToken(baseToken).
			TableId(tableID).
			PageSize(999)

		if sort != "" {
			reqBuilder.Sort(sort)
		} else if viewID != "" {
			reqBuilder.ViewId(viewID)
		}

		if pageToken != "" {
			reqBuilder.PageToken(pageToken)
		}

		req := reqBuilder.Build()

		resp, err := client.Bitable.AppTableRecord.List(context.Background(), req)
		if err != nil {
			return nil, fmt.Errorf("list records failed: %v", err)
		}
		if !resp.Success() {
			return nil, fmt.Errorf("list records api failed: code=%d, msg=%s", resp.Code, resp.Msg)
		}

		for _, item := range resp.Data.Items {
			records = append(records, item.Fields)
		}

		if resp.Data.HasMore != nil && *resp.Data.HasMore {
			if resp.Data.PageToken != nil {
				pageToken = *resp.Data.PageToken
			} else {
				hasMore = false
			}
		} else {
			hasMore = false
		}
	}

	return records, nil
}

// GetImageFromField extracts image URL or base64 string from a Feishu field
func GetImageFromField(field interface{}) string {
	if field == nil {
		return ""
	}
	switch v := field.(type) {
	case string:
		return v
	case []interface{}:
		if len(v) > 0 {
			if attachment, ok := v[0].(map[string]interface{}); ok {
				if url, ok := attachment["url"].(string); ok {
					return url
				}
			}
		}
	case map[string]interface{}:
		if url, ok := v["link"].(string); ok {
			return url
		}
	}
	return ""
}

// GetLinkFromField extracts URL from a Feishu Link field
func GetLinkFromField(field interface{}) string {
	if field == nil {
		return ""
	}
	switch v := field.(type) {
	case string:
		return v
	case map[string]interface{}:
		if link, ok := v["link"].(string); ok {
			return link
		}
	}
	return ""
}

type SponsorListResp struct {
	Items []model.Sponsor `json:"items"`
	Total int64           `json:"total"`
}

// GetSponsorList fetches sponsors with pagination
func GetSponsorList(client *lark.Client, baseToken, tableID, viewID string, page, pageSize int, sort string) (*SponsorListResp, error) {
	// Fetch all records first (Feishu API limitation for efficient random access pagination)
	records, err := GetTableRecords(client, baseToken, tableID, viewID, sort)
	if err != nil {
		return nil, err
	}

	total := int64(len(records))

	// 生成 ID 映射
	nameToID := make(map[string]string)
	idCounter := 1
	for _, fields := range records {
		name, _ := fields["赞赏者名称"].(string)
		if name != "" {
			var id string
			if name == "匿名" {
				id = fmt.Sprintf("%d", idCounter)
				idCounter++
			} else {
				if existingID, exists := nameToID[name]; exists {
					id = existingID
				} else {
					id = fmt.Sprintf("%d", idCounter)
					nameToID[name] = id
					idCounter++
				}
			}
			fields["_id"] = id
		}
	}

	start := (page - 1) * pageSize
	if start >= int(total) {
		return &SponsorListResp{
			Items: []model.Sponsor{},
			Total: total,
		}, nil
	}
	end := start + pageSize
	if end > int(total) {
		end = int(total)
	}

	var items []model.Sponsor
	for _, fields := range records[start:end] {
		name, _ := fields["赞赏者名称"].(string)
		avatar := GetImageFromField(fields["赞赏者头像链接"])
		link := GetLinkFromField(fields["赞赏者个人主页链接"])
		timeVal := ParseTime(fields["赞赏时间"])
		amount, _ := fields["赞赏金额"].(string)
		note, _ := fields["备注"].(string)

		if name != "" {
			id, _ := fields["_id"].(string)
			items = append(items, model.Sponsor{
				Name:   name,
				Avatar: avatar,
				Link:   link,
				Time:   timeVal,
				Amount: amount,
				Note:   note,
				ID:     id,
			})
		}
	}

	return &SponsorListResp{
		Items: items,
		Total: total,
	}, nil
}

// ParseTime handles different types for the time field (string, float64/int64 timestamp)
func ParseTime(val interface{}) string {
	if val == nil {
		return ""
	}
	switch v := val.(type) {
	case string:
		return v
	case float64:
		// Assume milliseconds
		return time.Unix(int64(v)/1000, 0).Format("2006-01-02 15:04")
	case int64:
		// Assume milliseconds
		return time.Unix(v/1000, 0).Format("2006-01-02 15:04")
	}
	return ""
}

// ImportSponsors imports data from a local JSON file to Feishu
// Note: This function contains specific logic for SponsorConfig and could be refactored further
func ImportSponsors(client *lark.Client, baseToken, tableID, filePath string) {
	// 读取文件
	data, err := os.ReadFile(filePath)
	if err != nil {
		log.Fatalf("读取文件失败: %v", err)
	}

	// 解析 JSON
	var config model.SponsorConfig
	if err := json.Unmarshal(data, &config); err != nil {
		log.Fatalf("解析 JSON 失败: %v", err)
	}

	count := 0
	for _, section := range config.Sections {
		for _, item := range section.List {
			// 构建字段
			fields := map[string]interface{}{
				"赞赏者名称":     item.Name,
				"赞赏者头像链接":   item.Avatar,
				"赞赏者个人主页链接": item.Link,
				"赞赏时间":      item.Time,
				"赞赏金额":      item.Amount,
				"备注":        item.Note,
			}

			// 创建记录
			req := larkbitable.NewCreateAppTableRecordReqBuilder().
				AppToken(baseToken).
				TableId(tableID).
				AppTableRecord(larkbitable.NewAppTableRecordBuilder().
					Fields(fields).
					Build()).
				Build()

			resp, err := client.Bitable.AppTableRecord.Create(context.Background(), req)
			if err != nil {
				log.Printf("创建记录失败 [%s]: %v", item.Name, err)
				continue
			}

			if !resp.Success() {
				log.Printf("API 调用失败 [%s]: %v", item.Name, resp.Msg)
				continue
			}

			fmt.Printf("成功创建记录: %s\n", item.Name)
			count++
		}
	}
	fmt.Printf("共导入 %d 条记录\n", count)
}
