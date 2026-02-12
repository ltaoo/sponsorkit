package svg

import (
	"sponsorkit/pkg/model"
	"strings"
	"testing"
)

func TestLoad(t *testing.T) {
	config := &model.SponsorConfig{
		Sections: []model.SponsorSection{
			{
				Title:      "Test Section",
				NumPerLine: 2,
				MaxWidth:   800,
				Gutter:     10,
				ShowText:   true,
				Shape:      "circle",
				List: []model.Sponsor{
					{
						Name:   "User 1",
						Avatar: "https://example.com/1.png",
						Link:   "https://example.com/1",
					},
					{
						Name:   "User 2",
						Avatar: "https://example.com/2.png",
						From:   "wechat",
					},
					{
						Name:   "User 3",
						Avatar: "", // Should use fallback
					},
				},
			},
		},
	}

	canvas := NewSponsorCanvas(800, 32)
	content, err := canvas.Load(config)
	if err != nil {
		t.Fatalf("Load failed: %v", err)
	}

	if !strings.Contains(content, "<svg") {
		t.Error("Content does not contain <svg tag")
	}
	if !strings.Contains(content, "User 1") {
		t.Error("Content does not contain User 1")
	}
	if !strings.Contains(content, "User 2") {
		t.Error("Content does not contain User 2")
	}
	if !strings.Contains(content, "User 3") {
		t.Error("Content does not contain User 3")
	}
	// Check for wechat avatar base64 (partial)
	if !strings.Contains(content, "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCmFyaWEtbGFiZWw9IldlQ2hhdCIgcm9sZT0iaW1nIgp2aWV3Qm94PSIwIDAgNTEyIDUxMiIKZmlsbD0iI2ZmZiI") {
		t.Error("Content does not contain Wechat avatar")
	}
}
