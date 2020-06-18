package dhcpd

import (
	"fmt"
	"net"
	"os"
	"path/filepath"
	"time"

	"github.com/AdguardTeam/golibs/log"
)

const defaultDiscoverTime = time.Second * 3
const leaseExpireStatic = 1

// serverV - DHCP server interface
type serverV interface {
	// ResetLeases - reset leases
	ResetLeases(leases []*Lease)
	// GetLeases - get leases
	GetLeases(flags int) []Lease
	// GetLeasesRef - get reference to leases array
	GetLeasesRef() []*Lease
	// AddStaticLease - add a static lease
	AddStaticLease(lease Lease) error
	// RemoveStaticLease - remove a static lease
	RemoveStaticLease(l Lease) error
	// FindMACbyIP - find a MAC address by IP address in the currently active DHCP leases
	FindMACbyIP(ip net.IP) net.HardwareAddr

	// WriteDiskConfig4 - copy disk configuration
	WriteDiskConfig4(c *V4ServerConf)
	// WriteDiskConfig6 - copy disk configuration
	WriteDiskConfig6(c *V6ServerConf)

	// Start - start server
	Start() error
	// Stop - stop server
	Stop()
}

// the current state of the DHCP server
type server struct {
	srv4 serverV
	srv6 serverV

	conf Config

	// Called when the leases DB is modified
	onLeaseChanged onLeaseChangedT
}

func createServer(config Config) Server {
	s := server{}
	s.conf.Enabled = config.Enabled
	s.conf.InterfaceName = config.InterfaceName
	s.conf.ConfigModified = config.ConfigModified
	s.conf.DBFilePath = filepath.Join(config.WorkDir, dbFilename)

	var err4, err6 error
	v4conf := config.Conf4
	v4conf.Enabled = s.conf.Enabled
	if len(v4conf.RangeStart) == 0 {
		v4conf.Enabled = false
	}
	v4conf.InterfaceName = s.conf.InterfaceName
	v4conf.notify = s.onNotify
	s.srv4, err4 = v4Create(v4conf)

	v6conf := config.Conf6
	v6conf.Enabled = s.conf.Enabled
	if len(v6conf.RangeStart) == 0 {
		v6conf.Enabled = false
	}
	v6conf.InterfaceName = s.conf.InterfaceName
	v6conf.notify = s.onNotify
	s.srv6, err6 = v6Create(v6conf)

	if err4 != nil {
		log.Error("%s", err4)
		return nil
	}
	if err6 != nil {
		log.Error("%s", err6)
		return nil
	}

	// we can't delay database loading until DHCP server is started,
	//  because we need static leases functionality available beforehand
	s.dbLoad()
	return &s
}

// server calls this function after DB is updated
func (s *server) onNotify(flags uint32) {
	if flags == LeaseChangedDBStore {
		s.dbStore()
		return
	}

	s.notify(int(flags))
}

// SetOnLeaseChanged - set callback
func (s *server) SetOnLeaseChanged(onLeaseChanged onLeaseChangedT) {
	s.onLeaseChanged = onLeaseChanged
}

func (s *server) notify(flags int) {
	if s.onLeaseChanged == nil {
		return
	}
	s.onLeaseChanged(flags)
}

// SetConfig - set configuration
func (s *server) SetConfig(c Config) error {
	c.Conf4.Enabled = c.Enabled
	if len(c.Conf4.RangeStart) == 0 {
		c.Conf4.Enabled = false
	}
	c.Conf4.InterfaceName = c.InterfaceName

	c4 := V4ServerConf{}
	s.srv4.WriteDiskConfig4(&c4)
	c.Conf4.notify = c4.notify
	c.Conf4.ICMPTimeout = c4.ICMPTimeout

	s4, err := v4Create(c.Conf4)
	if err != nil {
		return fmt.Errorf("Invalid DHCPv4 configuration: %s", err)
	}

	c.Conf6.Enabled = c.Enabled
	if len(c.Conf6.RangeStart) == 0 {
		c.Conf6.Enabled = false
	}
	c.Conf6.InterfaceName = c.InterfaceName
	c.Conf6.notify = s.onNotify
	s6, err := v6Create(c.Conf6)
	if s6 == nil {
		return fmt.Errorf("Invalid DHCPv6 configuration: %s", err)
	}

	if c.Enabled && !c.Conf4.Enabled && !c.Conf6.Enabled {
		return fmt.Errorf("DHCPv4 or DHCPv6 configuration must be complete")
	}

	s.Stop()

	s.conf.Enabled = c.Enabled
	s.conf.InterfaceName = c.InterfaceName
	s.srv4 = s4
	s.srv6 = s6

	s.conf.ConfigModified()

	if c.Enabled {
		staticIP, err := HasStaticIP(c.InterfaceName)
		if !staticIP && err == nil {
			err = SetStaticIP(c.InterfaceName)
			if err != nil {
				return fmt.Errorf("Failed to configure static IP: %s", err)
			}
		}

		err = s.Start()
		if err != nil {
			return fmt.Errorf("Failed to start DHCP server: %s", err)
		}
	}

	return nil
}

// WriteDiskConfig - write configuration
func (s *server) WriteDiskConfig(c *Config) {
	c.Enabled = s.conf.Enabled
	c.InterfaceName = s.conf.InterfaceName
	s.srv4.WriteDiskConfig4(&c.Conf4)
	s.srv6.WriteDiskConfig6(&c.Conf6)
}

// Start will listen on port 67 and serve DHCP requests.
func (s *server) Start() error {
	err := s.srv4.Start()
	if err != nil {
		log.Error("DHCPv4: start: %s", err)
		return err
	}

	err = s.srv6.Start()
	if err != nil {
		log.Error("DHCPv6: start: %s", err)
		return err
	}

	return nil
}

// Stop closes the listening UDP socket
func (s *server) Stop() {
	s.srv4.Stop()
	s.srv6.Stop()
}

// flags for Leases() function
const (
	LeasesDynamic = 1
	LeasesStatic  = 2
	LeasesAll     = LeasesDynamic | LeasesStatic
)

// Leases returns the list of current DHCP leases (thread-safe)
func (s *server) Leases(flags int) []Lease {
	result := s.srv4.GetLeases(flags)

	v6leases := s.srv6.GetLeases(flags)
	result = append(result, v6leases...)

	return result
}

// FindMACbyIP - find a MAC address by IP address in the currently active DHCP leases
func (s *server) FindMACbyIP(ip net.IP) net.HardwareAddr {
	if ip.To4() != nil {
		return s.srv4.FindMACbyIP(ip)
	}
	return s.srv6.FindMACbyIP(ip)
}

// AddStaticLease - add static lease
func (s *server) AddStaticLease(lease Lease) error {
	if lease.IP.To4() == nil {
		return s.srv6.AddStaticLease(lease)
	}
	return s.srv4.AddStaticLease(lease)
}

// RemoveStaticLease - remove static lease
func (s *server) RemoveStaticLease(lease Lease) error {
	if lease.IP.To4() == nil {
		return s.srv6.RemoveStaticLease(lease)
	}
	return s.srv4.RemoveStaticLease(lease)
}

func (s *server) Reset() {
	err := os.Remove(s.conf.DBFilePath)
	if err != nil && !os.IsNotExist(err) {
		log.Error("DHCP: os.Remove: %s: %s", s.conf.DBFilePath, err)
	}

	oldconf := s.conf
	s.conf = Config{}
	s.conf.WorkDir = oldconf.WorkDir
	s.conf.ConfigModified = oldconf.ConfigModified
	s.conf.DBFilePath = oldconf.DBFilePath

	v4conf := V4ServerConf{}
	v4conf.ICMPTimeout = 1000
	v4conf.notify = s.onNotify
	s.srv4, _ = v4Create(v4conf)

	v6conf := V6ServerConf{}
	v6conf.notify = s.onNotify
	s.srv6, _ = v6Create(v6conf)
}
