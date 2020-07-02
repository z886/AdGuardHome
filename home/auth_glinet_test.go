package home

import (
	"encoding/binary"
	"io/ioutil"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestAuthGL(t *testing.T) {
	tval := uint32(1)
	data := make([]byte, 4)
	if archIsLittleEndian() {
		binary.LittleEndian.PutUint32(data, tval)
	} else {
		binary.BigEndian.PutUint32(data, tval)
	}
	assert.Nil(t, ioutil.WriteFile("/tmp/gl_token_"+"test", data, 0644))
	assert.False(t, glCheckToken("test"))

	tval = uint32(time.Now().UTC().Unix() + 60)
	data = make([]byte, 4)
	if archIsLittleEndian() {
		binary.LittleEndian.PutUint32(data, tval)
	} else {
		binary.BigEndian.PutUint32(data, tval)
	}
	assert.Nil(t, ioutil.WriteFile("/tmp/gl_token_"+"test", data, 0644))
	assert.True(t, glCheckToken("test"))
}
