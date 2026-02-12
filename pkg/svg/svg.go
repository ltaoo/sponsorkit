package svg

import (
	"fmt"
	"math"
	"sponsorkit/pkg/model"
)

const (
	WECHAT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCmFyaWEtbGFiZWw9IldlQ2hhdCIgcm9sZT0iaW1nIgp2aWV3Qm94PSIwIDAgNTEyIDUxMiIKZmlsbD0iI2ZmZiI+PHBhdGgKZD0ibTAgMEg1MTJWNTEySDAiCmZpbGw9IiMwMGM3MGEiLz48cGF0aCBkPSJNNDAyIDM2OWMyMy0xNyAzOC00MiAzOC03MCAwLTUxLTUwLTkyLTExMS05MnMtMTEwIDQxLTExMCA5MiA0OSA5MiAxMTAgOTJjMTMgMCAyNS0yIDM2LTUgNC0xIDggMCA5IDFsMjUgMTRjMyAyIDYgMCA1LTRsLTYtMjJjMC0zIDItNSA0LTZtLTExMC04NWExNSAxNSAwIDExMC0yOSAxNSAxNSAwIDAxMCAyOW03NCAwYTE1IDE1IDAgMTEwLTI5IDE1IDE1IDAgMDEwIDI5Ii8+PHBhdGggZD0iTTI1MCAxOThhMTggMTggMCAwMDAtMzUgMTggMTggMCAxMDAgMzVtLTg5IDBhMTggMTggMCAwMDAtMzUgMTggMTggMCAxMDAgMzVtNDQtOTNjNjYgMCAxMjEgNDEgMTMxIDkzLTY0LTQtMTQ3IDQ0LTEyMyAxMjgtMyAwLTI1IDItNTEtNi00LTEtOCAwLTExIDJsLTMwIDE3Yy0zIDEtNy0xLTYtNmw3LTI0YzEtNS0xLTgtNC0xMC0yOC0yMC00NS01MC00NS04MyAwLTYxIDU5LTExMSAxMzItMTExIi8+PC9zdmc+"
	ALIPAY_AVATAR = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNzM1NzM0NTIwOTY2IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE0MzEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHBhdGggZD0iTTEwMjQuMDUxMiA3MDEuMDMwNFYxOTYuODY0QTE5Ni45NjY0IDE5Ni45NjY0IDAgMCAwIDgyNy4xMzYgMEgxOTYuODY0QTE5Ni45NjY0IDE5Ni45NjY0IDAgMCAwIDAgMTk2Ljg2NHY2MzAuMjcyQTE5Ni45MTUyIDE5Ni45MTUyIDAgMCAwIDE5Ni44NjQgMTAyNGg2MzAuMjcyYTE5Ny4xMiAxOTcuMTIgMCAwIDAgMTkzLjg0MzItMTYyLjA5OTJjLTUyLjIyNC0yMi42MzA0LTI3OC41MjgtMTIwLjMyLTM5Ni40NDE2LTE3Ni42NC04OS43MDI0IDEwOC42OTc2LTE4My43MDU2IDE3My45MjY0LTMyNS4zMjQ4IDE3My45MjY0cy0yMzYuMTg1Ni04Ny4yNDQ4LTIyNC44MTkyLTE5NC4wNDhjNy40NzUyLTcwLjA0MTYgNTUuNTUyLTE4NC41NzYgMjY0LjI5NDQtMTY0Ljk2NjQgMTEwLjA4IDEwLjM0MjQgMTYwLjQwOTYgMzAuODczNiAyNTAuMTYzMiA2MC41MTg0IDIzLjE5MzYtNDIuNTk4NCA0Mi40OTYtODkuNDQ2NCA1Ny4xMzkyLTEzOS4yNjRIMjQ4LjA2NHYtMzkuNDI0aDE5Ni45MTUyVjMxMS4xNDI0SDIwNC44VjI2Ny43NzZoMjQwLjEyOFYxNjUuNjMyczIuMTUwNC0xNS45NzQ0IDE5LjgxNDQtMTUuOTc0NGg5OC40NTc2VjI2Ny43NzZoMjU2djQzLjQxNzZoLTI1NlYzODEuOTUyaDIwOC44NDQ4YTgwNS45OTA0IDgwNS45OTA0IDAgMCAxLTg0LjgzODQgMjEyLjY4NDhjNjAuNjcyIDIyLjAxNiAzMzYuNzkzNiAxMDYuMzkzNiAzMzYuNzkzNiAxMDYuMzkzNnpNMjgzLjU0NTYgNzkxLjYwMzJjLTE0OS42NTc2IDAtMTczLjMxMi05NC40NjQtMTY1LjM3Ni0xMzMuOTM5MiA3LjgzMzYtMzkuMzIxNiA1MS4yLTkwLjYyNCAxMzQuNC05MC42MjQgOTUuNTkwNCAwIDE4MS4yNDggMjQuNDczNiAyODQuMDU3NiA3NC41NDcyLTcyLjE5MiA5NC4wMDMyLTE2MC45MjE2IDE1MC4wMTYtMjUzLjA4MTYgMTUwLjAxNnoiIGZpbGw9IiMwMDlGRTgiIHAtaWQ9IjE0MzIiPjwvcGF0aD48L3N2Zz4="
)

type SponsorCanvas struct {
	width   float64
	padding float64
	uid     int
}

func NewSponsorCanvas(width, padding float64) *SponsorCanvas {
	return &SponsorCanvas{
		width:   width,
		padding: padding,
		uid:     1,
	}
}

func (c *SponsorCanvas) Load(payload *model.SponsorConfig) (string, error) {
	height := 0.0
	svgContent := ""
	var prevY float64

	for i, section := range payload.Sections {
		initialY := prevY
		if i == 0 {
			initialY = c.padding
		}

		result := c.drawSection(section, i, initialY)
		prevY = result.y
		svgContent += result.content
		height = result.height + c.padding
	}

	return c.buildContent(c.width, height, svgContent), nil
}

type sectionResult struct {
	content string
	height  float64
	y       float64
}

func (c *SponsorCanvas) drawSection(payload model.SponsorSection, index int, initialY float64) sectionResult {
	point := struct{ x, y float64 }{0, 0}
	width := c.width

	// Move to initial position
	point.x = width / 2
	point.y = initialY

	titleHeight := 24.0
	textMarginTopToAvatar := 0.0
	if payload.ShowText {
		textMarginTopToAvatar = 4.0
	}
	textHeight := 0.0
	if payload.ShowText {
		textHeight = 18.0
	}
	titleBottomPadding := 6.0
	textBottomPadding := 0.0
	if payload.ShowText {
		textBottomPadding = 4.0
	}
	sponsorsMarginTopToTitle := 18.0

	point.y += titleHeight

	resultContent := fmt.Sprintf(`<text x="%f" y="%f" text-anchor="middle" class="sponsorkit-tier-title">%s</text>`,
		point.x, point.y, payload.Title)

	point.y += titleBottomPadding + sponsorsMarginTopToTitle

	// Calculate image size
	imageSize := 0.0
	effectiveWidth := width - c.padding*2
	if payload.MaxWidth > 0 {
		effectiveWidth = float64(payload.MaxWidth)
	}

	numPerLine := payload.NumPerLine
	if numPerLine < 1 {
		numPerLine = 1
	}

	gutter := float64(payload.Gutter)
	imageSize = toFixed((effectiveWidth - float64(numPerLine-1)*gutter) / float64(numPerLine))

	left := c.padding + imageSize/2
	if payload.MaxWidth > 0 {
		left = float64(payload.MaxWidth)/2 - imageSize/2
	}

	point.x = left

	groups := chunkArray(payload.List, numPerLine)
	for i, group := range groups {
		// If the line is not full, center it
		if len(group) <= numPerLine {
			w := float64(len(group)-1)*gutter + float64(len(group))*imageSize
			containerWidth := width
			newLeft := containerWidth/2 - w/2 + imageSize/2
			point.x = newLeft
		}

		for _, item := range group {
			imageURL := c.exchange(item.From, item.Avatar)
			if imageURL == "" {
				imageURL = WECHAT_AVATAR
			}

			imagePoint := struct{ x, y float64 }{
				x: point.x - imageSize/2,
				y: point.y,
			}

			textPoint := struct{ x, y float64 }{
				x: point.x,
				y: point.y + imageSize + textMarginTopToAvatar + textHeight,
			}

			nameText := ""
			if payload.ShowText {
				nameText = fmt.Sprintf(`<text x="%f" y="%f" text-anchor="middle" class="sponsorkit-name" fill="currentColor">%s</text>`,
					textPoint.x, textPoint.y, item.Name)
			}

			rx := imageSize / 8
			ry := imageSize / 8
			if payload.Shape == "circle" {
				rx = imageSize / 2
				ry = imageSize / 2
			}

			inner := fmt.Sprintf(`%s<clipPath id="c%d"><rect x="%f" y="%f" width="%f" height="%f" rx="%f" ry="%f" /></clipPath><image x="%f" y="%f" width="%f" height="%f" xlink:href="%s" clip-path="url(#c%d)" />`,
				nameText, c.uid, imagePoint.x, imagePoint.y, imageSize, imageSize, rx, ry,
				imagePoint.x, imagePoint.y, imageSize, imageSize, imageURL, c.uid)

			if item.Link != "" && item.Link != "#" {
				resultContent += fmt.Sprintf(`<a href="%s" class="sponsorkit-link" target="_blank" id="%s">%s</a>`,
					item.Link, item.Name, inner)
			} else {
				resultContent += inner
			}

			c.uid++
			point.x += imageSize + gutter
		}

		// Reset x for next line
		point.x = left
		// Move y down
		point.y += imageSize + textMarginTopToAvatar + textHeight
		if i < len(groups)-1 {
			point.y += gutter
		}
	}

	return sectionResult{
		content: resultContent,
		height:  toFixed(point.y + textBottomPadding),
		y:       point.y + textBottomPadding + c.padding,
	}
}

func (c *SponsorCanvas) buildContent(width, height float64, content string) string {
	return fmt.Sprintf(`<svg
          width="%f"
          height="%f"
          viewBox="0 0 %f %f"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
        >
          <style>
          text {
            font-weight: 300;
            font-size: 14px;
            fill: #777777;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          }
          .sponsorkit-link {
            cursor: pointer;
          }
          .sponsorkit-tier-title {
            font-weight: 500;
            font-size: 20px;
          }
          </style>
          %s
        </svg>`, width, height, width, height, content)
}

func (c *SponsorCanvas) exchange(from, url string) string {
	if from == "wechat" {
		return WECHAT_AVATAR
	}
	if from == "alipay" {
		return ALIPAY_AVATAR
	}
	return url
}

func toFixed(v float64) float64 {
	return math.Round(v*10) / 10
}

func chunkArray(arr []model.Sponsor, n int) [][]model.Sponsor {
	var result [][]model.Sponsor
	for i := 0; i < len(arr); i += n {
		end := i + n
		if end > len(arr) {
			end = len(arr)
		}
		result = append(result, arr[i:end])
	}
	return result
}
