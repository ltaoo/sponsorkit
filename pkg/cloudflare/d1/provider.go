package d1

import (
	"fmt"
	"sponsorkit/pkg/model"
)

// GetConfig fetches sponsor data from Cloudflare D1
func GetConfig(apiToken, accountID, databaseID string) (*model.SponsorConfig, error) {
	client := NewClient(accountID, apiToken)

	// Assumption: Table name is 'sponsors' and has columns 'text' and 'image'
	// You might need to adjust this SQL query based on your actual D1 table schema
	sql := "SELECT text, image FROM sponsors"
	resp, err := client.Query(databaseID, sql, nil)
	if err != nil {
		return nil, fmt.Errorf("d1 query failed: %v", err)
	}

	if len(resp.Result) == 0 {
		return nil, fmt.Errorf("no results found in d1 response")
	}

	// D1 query response can contain multiple results if multiple statements are executed.
	// We only executed one, so we look at the first result.
	result := resp.Result[0]
	if !result.Success {
		return nil, fmt.Errorf("d1 query execution failed")
	}

	var items []model.Sponsor
	for _, row := range result.Results {
		text, _ := row["text"].(string)
		image, _ := row["image"].(string)

		if text != "" {
			items = append(items, model.Sponsor{
				Name:   text,
				Avatar: image,
			})
		}
	}

	// Create a default section (similar to Feishu implementation)
	section := model.SponsorSection{
		Title:      "Thank you for your support",
		NumPerLine: 2,
		MaxWidth:   460,
		Gutter:     88,
		ShowText:   false,
		Shape:      "rounded",
		List:       items,
	}

	return &model.SponsorConfig{
		Sections: []model.SponsorSection{section},
	}, nil
}

// GetSponsorList fetches sponsors from Cloudflare D1 with pagination
func GetSponsorList(apiToken, accountID, databaseID string, page, pageSize int) ([]model.Sponsor, int64, error) {
	client := NewClient(accountID, apiToken)

	// Get total count
	countSql := "SELECT count(*) as total FROM sponsors"
	countResp, err := client.Query(databaseID, countSql, nil)
	if err != nil {
		return nil, 0, fmt.Errorf("d1 count query failed: %v", err)
	}

	if len(countResp.Result) == 0 {
		return nil, 0, fmt.Errorf("no results found in d1 count response")
	}

	var total int64
	if len(countResp.Result[0].Results) > 0 {
		if t, ok := countResp.Result[0].Results[0]["total"].(float64); ok {
			total = int64(t)
		}
	}

	offset := (page - 1) * pageSize
	sql := "SELECT text, image FROM sponsors LIMIT ? OFFSET ?"
	params := []any{pageSize, offset}
	resp, err := client.Query(databaseID, sql, params)
	if err != nil {
		return nil, 0, fmt.Errorf("d1 query failed: %v", err)
	}

	if len(resp.Result) == 0 {
		return nil, 0, fmt.Errorf("no results found in d1 response")
	}

	result := resp.Result[0]
	if !result.Success {
		return nil, 0, fmt.Errorf("d1 query execution failed")
	}

	var items []model.Sponsor
	for _, row := range result.Results {
		text, _ := row["text"].(string)
		image, _ := row["image"].(string)

		if text != "" {
			items = append(items, model.Sponsor{
				Name:   text,
				Avatar: image,
			})
		}
	}

	return items, total, nil
}
