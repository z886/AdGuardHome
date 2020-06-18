package querylog

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/AdguardTeam/AdGuardHome/util"

	"github.com/AdguardTeam/golibs/log"
)

// Register web handlers
func (l *queryLog) initWeb() {
	l.conf.HTTPRegister("GET", "/control/querylog", l.handleQueryLog)
}

func httpError(r *http.Request, w http.ResponseWriter, code int, format string, args ...interface{}) {
	text := fmt.Sprintf(format, args...)

	log.Info("QueryLog: %s %s: %s", r.Method, r.URL, text)

	http.Error(w, text, code)
}

func (l *queryLog) handleQueryLog(w http.ResponseWriter, r *http.Request) {
	params, err := l.parseSearchParams(r)
	if err != nil {
		httpError(r, w, http.StatusBadRequest, "failed to parse params: %s", err)
		return
	}

	// search for the log entries
	entries, oldest := l.search(params)

	// convert log entries to JSON
	var data = l.entriesToJSON(entries, oldest)

	jsonVal, err := json.Marshal(data)
	if err != nil {
		httpError(r, w, http.StatusInternalServerError, "Couldn't marshal data into json: %s", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_, err = w.Write(jsonVal)
	if err != nil {
		httpError(r, w, http.StatusInternalServerError, "Unable to write response json: %s", err)
	}
}

// "value" -> value, return TRUE
func getDoubleQuotesEnclosedValue(s *string) bool {
	t := *s
	if len(t) >= 2 && t[0] == '"' && t[len(t)-1] == '"' {
		*s = t[1 : len(t)-1]
		return true
	}
	return false
}

// parseSearchCriteria - parses "searchCriteria" from the specified query parameter
func (l *queryLog) parseSearchCriteria(q url.Values, name string, ct criteriaType) (bool, searchCriteria, error) {
	val := q.Get(name)
	if len(val) == 0 {
		return false, searchCriteria{}, nil
	}

	c := searchCriteria{
		criteriaType: ct,
		value:        val,
	}
	if getDoubleQuotesEnclosedValue(&c.value) {
		c.strict = true
	}

	if ct == ctClient && l.conf.AnonymizeClientIP {
		c.value = l.getClientIP(c.value)
	}

	if ct == ctFilteringStatus && !util.ContainsString(filteringStatusValues, c.value) {
		return false, c, fmt.Errorf("invalid value %s", c.value)
	}

	return true, c, nil
}

// parseSearchParams - parses "searchParams" from the HTTP request's query string
func (l *queryLog) parseSearchParams(r *http.Request) (*searchParams, error) {
	p := newSearchParams()

	var err error
	q := r.URL.Query()
	olderThan := q.Get("older_than")
	if len(olderThan) != 0 {
		p.olderThan, err = time.Parse(time.RFC3339Nano, olderThan)
		if err != nil {
			return nil, err
		}
	}

	if limit, err := strconv.ParseInt(q.Get("limit"), 10, 64); err == nil {
		p.limit = int(limit)

		// If limit or offset are specified explicitly, we should change the default behavior
		// and scan all log records until we found enough log entries
		p.maxFileScanEntries = 0
	}
	if offset, err := strconv.ParseInt(q.Get("offset"), 10, 64); err == nil {
		p.offset = int(offset)
		p.maxFileScanEntries = 0
	}

	paramNames := map[string]criteriaType{
		"filter_domain":          ctDomain,
		"filter_client":          ctClient,
		"filter_question_type":   ctQuestionType,
		"filter_response_status": ctFilteringStatus,
	}

	for k, v := range paramNames {
		ok, c, err := l.parseSearchCriteria(q, k, v)
		if err != nil {
			return nil, err
		}

		if ok {
			p.searchCriteria = append(p.searchCriteria, c)
		}
	}

	return p, nil
}
