package model

type SponsorSection struct {
	Title      string    `json:"title"`
	NumPerLine int       `json:"num_per_line"`
	MaxWidth   int       `json:"max_width"`
	Gutter     int       `json:"gutter"`
	ShowText   bool      `json:"show_text"`
	Shape      string    `json:"shape"`
	List       []Sponsor `json:"list"`
}

type SponsorConfig struct {
	Sections []SponsorSection `json:"sections"`
}

type Sponsor struct {
	Name   string `json:"text"`
	Avatar string `json:"image,omitempty"`
	Link   string `json:"href,omitempty"`
	Time   string `json:"time"`
	Amount string `json:"amount"`
	Note   string `json:"note,omitempty"`
	From   string `json:"from,omitempty"`
}
