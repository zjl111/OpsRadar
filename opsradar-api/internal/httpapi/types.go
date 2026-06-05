package httpapi

type dbUser struct {
	ID           string
	Username     string
	PasswordHash string
	DisplayName  string
	Role         string
	Permissions  []string
	IsActive     bool
}

type PublicUser struct {
	ID          string   `json:"id"`
	Username    string   `json:"username"`
	DisplayName string   `json:"display_name,omitempty"`
	Role        string   `json:"role"`
	Permissions []string `json:"permissions"`
}

func (u dbUser) public() PublicUser {
	return PublicUser{ID: u.ID, Username: u.Username, DisplayName: u.DisplayName, Role: u.Role, Permissions: u.Permissions}
}
