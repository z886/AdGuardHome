package dhcpd

import (
	"net"
	"time"
)

type Server interface {
	SetOnLeaseChanged(onLeaseChanged onLeaseChangedT)
	SetConfig(c Config) error
	GetConfig(c *Config)
	Start() error
	Stop()
	Leases(flags int) []Lease
	FindMACbyIP(ip net.IP) net.HardwareAddr
	AddStaticLease(lease Lease) error
	RemoveStaticLease(lease Lease) error
	Reset()
}

func Create(conf Config) Server {
	return createServer(conf)
}

// Lease contains the necessary information about a DHCP lease
type Lease struct {
	HWAddr   net.HardwareAddr `json:"mac"`
	IP       net.IP           `json:"ip"`
	Hostname string           `json:"hostname"`

	// Lease expiration time
	// 1: static lease
	Expiry time.Time `json:"expires"`
}

type onLeaseChangedT func(flags int)

// flags for onLeaseChanged()
const (
	LeaseChangedAdded = iota
	LeaseChangedAddedStatic
	LeaseChangedRemovedStatic
	LeaseChangedBlacklisted

	LeaseChangedDBStore
)

// ServerConfig - DHCP server configuration
type Config struct {
	Enabled       bool   `yaml:"enabled"`
	InterfaceName string `yaml:"interface_name"`

	Conf4 V4ServerConf `yaml:"dhcpv4"`
	Conf6 V6ServerConf `yaml:"dhcpv6"`

	WorkDir    string `yaml:"-"`
	DBFilePath string `yaml:"-"` // path to DB file

	// Called when the configuration is changed by HTTP request
	ConfigModified func() `yaml:"-"`
}

// V4ServerConf - server configuration
type V4ServerConf struct {
	Enabled       bool   `yaml:"-"`
	InterfaceName string `yaml:"-"`

	GatewayIP  string `yaml:"gateway_ip"`
	SubnetMask string `yaml:"subnet_mask"`

	// The first & the last IP address for dynamic leases
	// Bytes [0..2] of the last allowed IP address must match the first IP
	RangeStart string `yaml:"range_start"`
	RangeEnd   string `yaml:"range_end"`

	LeaseDuration uint32 `yaml:"lease_duration"` // in seconds

	// IP conflict detector: time (ms) to wait for ICMP reply
	// 0: disable
	ICMPTimeout uint32 `yaml:"icmp_timeout_msec"`

	ipStart    net.IP        // starting IP address for dynamic leases
	ipEnd      net.IP        // ending IP address for dynamic leases
	leaseTime  time.Duration // the time during which a dynamic lease is considered valid
	dnsIPAddrs []net.IP      // IPv4 addresses to return to DHCP clients as DNS server addresses
	routerIP   net.IP        // value for Option Router
	subnetMask net.IPMask    // value for Option SubnetMask

	// Server calls this function when leases data changes
	notify func(uint32)
}

// V6ServerConf - server configuration
type V6ServerConf struct {
	Enabled       bool   `yaml:"-"`
	InterfaceName string `yaml:"-"`

	// The first IP address for dynamic leases
	// The last allowed IP address ends with 0xff byte
	RangeStart string `yaml:"range_start"`

	LeaseDuration uint32 `yaml:"lease_duration"` // in seconds

	ipStart    net.IP        // starting IP address for dynamic leases
	leaseTime  time.Duration // the time during which a dynamic lease is considered valid
	dnsIPAddrs []net.IP      // IPv6 addresses to return to DHCP clients as DNS server addresses

	// Server calls this function when leases data changes
	notify func(uint32)
}
