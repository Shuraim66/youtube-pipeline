package utils

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// FileHelper provides file system utilities
type FileHelper struct{}

// NewFileHelper creates a new file helper
func NewFileHelper() *FileHelper {
	return &FileHelper{}
}

// EnsureDir creates a directory if it doesn't exist
func (f *FileHelper) EnsureDir(path string) error {
	return os.MkdirAll(path, 0755)
}

// EnsureDirs creates multiple directories
func (f *FileHelper) EnsureDirs(paths ...string) error {
	for _, path := range paths {
		if err := f.EnsureDir(path); err != nil {
			return err
		}
	}
	return nil
}

// ReadFile reads a file and returns its contents
func (f *FileHelper) ReadFile(path string) ([]byte, error) {
	return os.ReadFile(path)
}

// WriteFile writes data to a file
func (f *FileHelper) WriteFile(path string, data []byte, perm os.FileMode) error {
	return os.WriteFile(path, data, perm)
}

// WriteJSON writes data as JSON to a file
func (f *FileHelper) WriteJSON(path string, v interface{}, indent bool) error {
	var data []byte
	var err error

	if indent {
		data, err = json.MarshalIndent(v, "", "  ")
	} else {
		data, err = json.Marshal(v)
	}
	if err != nil {
		return err
	}

	return f.WriteFile(path, data, 0644)
}

// ReadJSON reads JSON from a file into v
func (f *FileHelper) ReadJSON(path string, v interface{}) error {
	data, err := f.ReadFile(path)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, v)
}

// AppendFile appends data to a file
func (f *FileHelper) AppendFile(path string, data []byte) error {
	file, err := os.OpenFile(path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = file.Write(data)
	return err
}

// CopyFile copies a file from src to dst
func (f *FileHelper) CopyFile(src, dst string) error {
	source, err := os.Open(src)
	if err != nil {
		return err
	}
	defer source.Close()

	dest, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer dest.Close()

	_, err = io.Copy(dest, source)
	return err
}

// DeleteFile removes a file
func (f *FileHelper) DeleteFile(path string) error {
	return os.Remove(path)
}

// FileExists checks if a file exists
func (f *FileHelper) FileExists(path string) bool {
	_, err := os.Stat(path)
	return !os.IsNotExist(err)
}

// ListFiles lists files in a directory matching a pattern
func (f *FileHelper) ListFiles(dir, pattern string) ([]string, error) {
	matches, err := filepath.Glob(filepath.Join(dir, pattern))
	if err != nil {
		return nil, err
	}
	return matches, nil
}

// GetTimestampedFilename generates a timestamped filename
func (f *FileHelper) GetTimestampedFilename(base, ext string) string {
	timestamp := time.Now().Format("20060102_150405")
	return fmt.Sprintf("%s_%s.%s", base, timestamp, ext)
}

// SanitizeFilename removes or replaces invalid characters from filenames
func (f *FileHelper) SanitizeFilename(name string) string {
	// Replace invalid characters
	invalid := `<>:"/\|?*`
	result := strings.Builder{}
	for _, ch := range name {
		if strings.ContainsRune(invalid, ch) || ch < 32 {
			result.WriteByte('_')
		} else {
			result.WriteRune(ch)
		}
	}
	return result.String()
}

// GetRelativePath gets the relative path from a base directory
func (f *FileHelper) GetRelativePath(base, fullPath string) (string, error) {
	rel, err := filepath.Rel(base, fullPath)
	if err != nil {
		return "", err
	}
	return rel, nil
}

// JoinPath joins path elements and cleans the result
func (f *FileHelper) JoinPath(elem ...string) string {
	return filepath.Clean(filepath.Join(elem...))
}