export interface CommandContext {
  topic: string
  domain?: string
}

export type CommandFn = (args: string[], context: CommandContext) => string

// Fake file system
const FAKE_FILES: Record<string, string> = {
  '/etc/passwd': `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
user:x:1000:1000:User,,,:/home/user:/bin/bash`,
  '/etc/hosts': `127.0.0.1   localhost
127.0.1.1   vaathi-lab
::1         localhost ip6-localhost ip6-loopback
10.10.10.1  gateway
10.10.10.2  target.lab`,
  '/etc/shadow': `Permission denied.`,
  '/var/log/auth.log': `May 21 09:12:01 vaathi-lab sshd[1234]: Failed password for root from 192.168.1.105 port 44312 ssh2
May 21 09:12:03 vaathi-lab sshd[1234]: Failed password for root from 192.168.1.105 port 44312 ssh2
May 21 09:12:05 vaathi-lab sshd[1234]: Failed password for root from 192.168.1.105 port 44312 ssh2
May 21 09:15:22 vaathi-lab sshd[1289]: Accepted publickey for user from 10.0.2.2 port 52340 ssh2
May 21 09:18:01 vaathi-lab sudo[1301]: user : TTY=pts/0 ; PWD=/home/user ; USER=root ; COMMAND=/bin/ls`,
  'flag.txt': `CTF{vaathi_terminal_sandbox_r0ck5}`,
  'notes.txt': `TODO:
- Fix XSS vulnerability in login form
- Update SSL certificate
- Patch Apache to 2.4.55
- Review firewall rules`,
  'secret.txt': `Password: P@ssw0rd123
API Key: sk-test-AbCdEfGhIjKlMnOpQrStUvWxYz`,
}

// Color helpers (ANSI-like for terminal display)
const C = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
}

export const COMMANDS: Record<string, CommandFn> = {
  help: (_args, _ctx) => {
    return `${C.cyan('Available commands:')}
  ${C.green('Network:')}    nmap, ping, traceroute, netstat, ss, tcpdump, ifconfig, ip
  ${C.green('Web:')}        curl, wget, whois, dig, host
  ${C.green('Crypto:')}     base64, openssl
  ${C.green('System:')}     whoami, id, uname, ls, cat, echo, python3, iptables
  ${C.green('Other:')}      help, clear

Type any command with ${C.yellow('--help')} for usage.`
  },

  nmap: (args, ctx) => {
    if (args.includes('--help')) {
      return `${C.cyan('nmap')} - Network exploration tool and security scanner
Usage: nmap [options] target
  -sV     Version detection
  -sC     Script scan
  -p-     All ports
  -A      Aggressive scan (OS, version, scripts)
  -O      OS detection
  --open  Show only open ports`
    }

    const target = args.find((a) => !a.startsWith('-')) || '10.10.10.1'
    const isAggressive = args.includes('-A') || args.includes('-sV')
    const allPorts = args.includes('-p-')

    // Domain-aware port selection
    let ports: Array<{ port: number; state: string; service: string; version?: string }> = []

    if (ctx.domain === 'web') {
      ports = [
        { port: 22, state: 'open', service: 'ssh', version: 'OpenSSH 8.9p1' },
        { port: 80, state: 'open', service: 'http', version: 'Apache httpd 2.4.52' },
        { port: 443, state: 'open', service: 'https', version: 'Apache httpd 2.4.52' },
        { port: 8080, state: 'open', service: 'http-proxy', version: 'nginx 1.18.0' },
        { port: 3306, state: 'filtered', service: 'mysql' },
      ]
    } else if (ctx.domain === 'networking') {
      ports = [
        { port: 21, state: 'open', service: 'ftp', version: 'vsftpd 3.0.5' },
        { port: 22, state: 'open', service: 'ssh', version: 'OpenSSH 8.9p1' },
        { port: 23, state: 'closed', service: 'telnet' },
        { port: 25, state: 'filtered', service: 'smtp' },
        { port: 53, state: 'open', service: 'domain', version: 'BIND 9.18.1' },
        { port: 445, state: 'open', service: 'microsoft-ds', version: 'Samba 4.15' },
      ]
    } else {
      ports = [
        { port: 22, state: 'open', service: 'ssh', version: 'OpenSSH 8.9p1 Ubuntu 3ubuntu0.4' },
        { port: 80, state: 'open', service: 'http', version: 'Apache httpd 2.4.52' },
        { port: 443, state: 'open', service: 'ssl/http', version: 'Apache httpd 2.4.52' },
        { port: 8443, state: 'open', service: 'https-alt' },
        ...(allPorts ? [
          { port: 31337, state: 'open', service: 'unknown', version: 'backdoor?' },
        ] : []),
      ]
    }

    const openPorts = ports.filter((p) => p.state === 'open')
    const portLines = ports.map((p) => {
      const stateColor = p.state === 'open' ? C.green(p.state.padEnd(8)) :
        p.state === 'filtered' ? C.yellow(p.state.padEnd(8)) : C.red(p.state.padEnd(8))
      const version = isAggressive && p.version ? p.version : ''
      return `${String(p.port).padStart(5)}/tcp  ${stateColor} ${p.service.padEnd(16)} ${version}`
    }).join('\n')

    return `Starting Nmap 7.93 ( https://nmap.org )
Nmap scan report for ${target}
Host is up (0.00045s latency).

PORT     STATE     SERVICE          VERSION
${portLines}

${isAggressive ? `OS details: Linux 5.15 - 5.19
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel` : ''}

Nmap done: 1 IP address (1 host up) scanned in ${(Math.random() * 3 + 1).toFixed(2)} seconds
${C.yellow(`[*] ${openPorts.length} open port(s) found`)}`
  },

  ping: (args, _ctx) => {
    if (args.includes('--help')) {
      return `${C.cyan('ping')} - Send ICMP ECHO_REQUEST to network hosts
Usage: ping [-c count] [-i interval] host`
    }
    const target = args.find((a) => !a.startsWith('-')) || 'google.com'
    const count = parseInt(args[args.indexOf('-c') + 1] || '4')
    const times = Array.from({ length: Math.min(count, 4) }, () => (Math.random() * 20 + 1).toFixed(3))

    const lines = times.map((t, i) =>
      `64 bytes from ${target}: icmp_seq=${i + 1} ttl=64 time=${t} ms`
    ).join('\n')

    const avg = (times.reduce((s, t) => s + parseFloat(t), 0) / times.length).toFixed(3)
    return `PING ${target} (93.184.216.34) 56(84) bytes of data.
${lines}

--- ${target} ping statistics ---
${times.length} packets transmitted, ${times.length} received, 0% packet loss, time ${parseInt(avg) * times.length}ms
rtt min/avg/max/mdev = ${(parseFloat(times[0]) * 0.9).toFixed(3)}/${avg}/${(parseFloat(times[times.length - 1]) * 1.1).toFixed(3)}/0.412 ms`
  },

  netstat: (args, _ctx) => {
    if (args.includes('--help')) {
      return `${C.cyan('netstat')} - Print network connections, routing tables, interface statistics
Usage: netstat [-tulpn]
  -t   TCP connections
  -u   UDP connections
  -l   Listening sockets
  -p   Show PID/program name
  -n   Numeric output`
    }
    return `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      1/systemd
tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN      892/mysqld
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      654/apache2
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN      654/apache2
tcp6       0      0 :::22                   :::*                    LISTEN      1/systemd
tcp6       0      0 :::80                   :::*                    LISTEN      654/apache2
udp        0      0 0.0.0.0:68              0.0.0.0:*                           789/dhclient
udp        0      0 127.0.0.53:53           0.0.0.0:*                           512/systemd-resolve`
  },

  ss: (args, _ctx) => {
    return `Netid  State   Recv-Q  Send-Q   Local Address:Port     Peer Address:Port   Process
tcp    LISTEN  0       128          0.0.0.0:22            0.0.0.0:*       users:(("sshd",pid=1,fd=3))
tcp    LISTEN  0       511          0.0.0.0:80            0.0.0.0:*       users:(("apache2",pid=654,fd=4))
tcp    LISTEN  0       128        127.0.0.1:3306          0.0.0.0:*       users:(("mysqld",pid=892,fd=23))
tcp    ESTAB   0       0        10.10.10.15:22          10.10.10.5:41234  users:(("sshd",pid=1567,fd=4))`
  },

  curl: (args, ctx) => {
    if (args.includes('--help')) {
      return `${C.cyan('curl')} - Transfer data from/to a server
Usage: curl [options] URL
  -I       Fetch headers only
  -v       Verbose output
  -X       Specify request method
  -H       Add header
  -d       POST data
  -k       Insecure (skip TLS verify)
  -b       Cookies`
    }

    const url = args.find((a) => !a.startsWith('-') && (a.startsWith('http') || a.includes('.'))) || 'http://target.lab'
    const headersOnly = args.includes('-I') || args.includes('--head')
    const verbose = args.includes('-v')

    if (headersOnly) {
      return `${verbose ? `* Connected to ${url} port 80\n> HEAD / HTTP/1.1\n> Host: ${url}\n< ` : ''}HTTP/1.1 200 OK
Date: ${new Date().toUTCString()}
Server: Apache/2.4.52 (Ubuntu)
X-Powered-By: PHP/8.1.2
X-Frame-Options: SAMEORIGIN
Content-Type: text/html; charset=UTF-8
${C.yellow('X-XSS-Protection: 0')}
${C.red('Server: Apache/2.4.52 (Ubuntu)')} ${C.dim('← Version disclosure!')}`
    }

    if (ctx.domain === 'web') {
      return `<!DOCTYPE html>
<html>
<head><title>Target Web App</title></head>
<body>
  <form action="/login" method="POST">
    <input name="username" type="text">
    <input name="password" type="password">
    <!-- TODO: add CSRF token -->
  </form>
  <!-- Debug mode enabled: ?debug=1 -->
</body>
</html>`
    }

    return `<!DOCTYPE html>
<html><head><title>Welcome</title></head>
<body><h1>Hello from ${url}</h1></body>
</html>`
  },

  wget: (args, _ctx) => {
    const url = args.find((a) => !a.startsWith('-')) || 'http://target.lab/file.txt'
    const filename = url.split('/').pop() || 'index.html'
    return `--${new Date().toISOString().slice(11, 19)}--  ${url}
Resolving target.lab... 10.10.10.1
Connecting to target.lab|10.10.10.1|:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 4096 (4.0K) [text/plain]
Saving to: '${filename}'

${filename}   100%[===================>]   4.00K  --.-KB/s    in 0s

${new Date().toISOString().slice(11, 19)} (24.5 MB/s) - '${filename}' saved [4096/4096]`
  },

  whois: (args, _ctx) => {
    const domain = args.find((a) => !a.startsWith('-')) || 'example.com'
    return `Domain Name: ${domain.toUpperCase()}
Registry Domain ID: 2336799_DOMAIN_COM-VRSN
Registrar WHOIS Server: whois.networksolutions.com
Updated Date: 2023-08-14T07:01:31Z
Creation Date: 1995-08-14T04:00:00Z
Registry Expiry Date: 2024-08-13T04:00:00Z
Registrant Organization: Example Corporation
Registrant State/Province: CA
Registrant Country: US
Name Server: A.IANA-SERVERS.NET
Name Server: B.IANA-SERVERS.NET
DNSSEC: unsigned

${C.yellow('[*] Registration info can reveal organizational structure for OSINT')}`
  },

  dig: (args, _ctx) => {
    const domain = args.find((a) => !a.startsWith('-') && !['ANY', 'MX', 'NS', 'TXT', 'A', 'AAAA'].includes(a.toUpperCase())) || 'example.com'
    const type = args.find((a) => ['ANY', 'MX', 'NS', 'TXT', 'A', 'AAAA'].includes(a.toUpperCase())) || 'A'

    return `; <<>> DiG 9.18.1 <<>> ${domain} ${type}
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 12345
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; QUESTION SECTION:
;${domain}.            IN      ${type}

;; ANSWER SECTION:
${type === 'MX' ?
`${domain}.    3600    IN  MX  10 mail.${domain}.` :
type === 'NS' ?
`${domain}.    3600    IN  NS  ns1.${domain}.
${domain}.    3600    IN  NS  ns2.${domain}.` :
type === 'TXT' ?
`${domain}.    3600    IN  TXT "v=spf1 include:_spf.google.com ~all"
${domain}.    3600    IN  TXT "google-site-verification=abc123"` :
`${domain}.    3600    IN  A   93.184.216.34`}

;; Query time: 12 msec
;; SERVER: 8.8.8.8#53(8.8.8.8)
;; WHEN: ${new Date().toUTCString()}`
  },

  host: (args, _ctx) => {
    const target = args.find((a) => !a.startsWith('-')) || 'example.com'
    const isIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(target)
    if (isIP) {
      return `${target}.in-addr.arpa domain name pointer host-${target.replace(/\./g, '-')}.example.com.`
    }
    return `${target} has address 93.184.216.34
${target} has IPv6 address 2606:2800:21f:cb07:6820:80da:af6b:8b2c
${target} mail is handled by 10 mail.${target}.`
  },

  traceroute: (args, _ctx) => {
    const target = args.find((a) => !a.startsWith('-')) || 'google.com'
    const hops = [
      '10.0.2.1', '192.168.1.1', '100.96.0.1', '72.14.232.1',
      '108.170.246.33', '209.85.240.101', `${target}`
    ]
    const lines = hops.map((hop, i) => {
      const t = (Math.random() * 20 + i * 5).toFixed(3)
      return ` ${i + 1}  ${hop}  ${t} ms  ${(parseFloat(t) * 0.98).toFixed(3)} ms  ${(parseFloat(t) * 1.02).toFixed(3)} ms`
    })
    return `traceroute to ${target}, 30 hops max, 60 byte packets
${lines.join('\n')}`
  },

  base64: (args, _ctx) => {
    if (args.includes('--help')) {
      return `${C.cyan('base64')} - Encode/decode data
Usage: base64 [options] [file]
  -d, --decode   Decode data`
    }
    const decode = args.includes('-d') || args.includes('--decode')
    const input = args.filter((a) => !a.startsWith('-')).join(' ')

    if (!input) {
      return `${C.red('Error:')} No input provided. Usage: base64 -d <encoded_string> or echo "text" | base64`
    }

    if (decode) {
      try {
        return atob(input)
      } catch {
        return `${C.red('Error:')} Invalid base64 input`
      }
    } else {
      return btoa(input)
    }
  },

  openssl: (args, _ctx) => {
    if (args.includes('--help') || args.length === 0) {
      return `${C.cyan('openssl')} - OpenSSL command line tool
Commands: enc, dgst, s_client, genrsa, req, x509, rand
Example: openssl dgst -sha256 file.txt
         openssl rand -hex 16
         openssl s_client -connect host:443`
    }

    const subcommand = args[0]
    if (subcommand === 'rand') {
      const hex = args.includes('-hex')
      const size = parseInt(args[args.length - 1]) || 16
      const bytes = Array.from({ length: size }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('')
      return hex ? bytes : btoa(String.fromCharCode(...bytes.match(/.{2}/g)!.map((h) => parseInt(h, 16))))
    }

    if (subcommand === 'dgst') {
      const algo = args.find((a) => a.startsWith('-'))?.slice(1) || 'sha256'
      const file = args[args.length - 1]
      const hash = Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')
      return `${algo}(${file})= ${hash}`
    }

    if (subcommand === 's_client') {
      const connect = args[args.indexOf('-connect') + 1] || 'example.com:443'
      return `CONNECTED(00000003)
depth=2 C = US, O = DigiCert Inc, CN = DigiCert Global Root CA
depth=1 C = US, O = DigiCert Inc, CN = DigiCert TLS RSA SHA256 2020 CA1
depth=0 CN = ${connect.split(':')[0]}
---
Certificate chain
 0 s:CN = ${connect.split(':')[0]}
   i:C = US, O = DigiCert Inc, CN = DigiCert TLS RSA SHA256 2020 CA1
---
SSL handshake has read 4280 bytes and written 361 bytes
New, TLSv1.3, Cipher is TLS_AES_256_GCM_SHA384
---
${C.yellow('[*] TLS 1.3 — Good! No deprecated protocols.')}`
    }

    return `openssl ${subcommand}: command not found. Try 'openssl --help'`
  },

  python3: (args, _ctx) => {
    if (args.length === 0 || args.includes('-c') === false) {
      return `${C.cyan('Python 3.11.2')} (default, Mar 13 2023)
[GCC 12.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
${C.dim('>>> ')}${C.yellow('[Interactive mode — type python3 -c "code" to run a snippet]')}`
    }
    const code = args[args.indexOf('-c') + 1] || ''
    if (code.includes('print')) {
      const match = code.match(/print\(['"](.+?)['"]\)/)
      return match ? match[1] : 'None'
    }
    if (code.includes('import socket')) {
      return `<module 'socket' from '/usr/lib/python3.11/socket.py'>
${C.green('[*] Socket module loaded — can be used for network connections')}`
    }
    return `${C.dim('# Output would appear here')}`
  },

  echo: (args, _ctx) => {
    return args.join(' ')
  },

  cat: (args, _ctx) => {
    if (args.includes('--help')) {
      return `${C.cyan('cat')} - Concatenate files and print to stdout
Usage: cat [file...]`
    }
    const file = args.find((a) => !a.startsWith('-'))
    if (!file) return `${C.red('cat: missing file operand')}`

    // Check fake filesystem
    const content = FAKE_FILES[file] || FAKE_FILES[`./${file}`]
    if (content) return content

    // Common fake files
    if (file.includes('flag') || file.endsWith('.txt') || file.endsWith('.log')) {
      return `${C.red(`cat: ${file}: No such file or directory`)}`
    }

    return `${C.red(`cat: ${file}: No such file or directory`)}`
  },

  ls: (args, _ctx) => {
    const longFormat = args.includes('-l') || args.includes('-la') || args.includes('-al')
    const showHidden = args.includes('-a') || args.includes('-la') || args.includes('-al')
    const path = args.find((a) => !a.startsWith('-')) || '.'

    if (path === '/etc') {
      if (longFormat) {
        return `total 248
drwxr-xr-x  78 root root  4096 May 21 09:00 .
drwxr-xr-x  18 root root  4096 May 21 08:00 ..
-rw-r--r--   1 root root  2981 May 21 09:00 ${C.green('hosts')}
-rw-r--r--   1 root root  1722 May 21 09:00 ${C.green('passwd')}
-rw-r-----   1 root shadow  870 May 21 09:00 ${C.red('shadow')}
-rw-r--r--   1 root root   767 May 21 09:00 ${C.green('hostname')}
drwxr-xr-x   3 root root  4096 May 21 09:00 ${C.cyan('nginx')}`
      }
      return `hosts  hostname  passwd  shadow  nginx/  cron.d/  sudoers`
    }

    if (longFormat) {
      return `total 48
drwxr-xr-x  5 user user 4096 May 21 09:15 ${C.cyan('.')}
drwxr-xr-x  3 root root 4096 May 20 08:00 ${C.cyan('..')}
${showHidden ? `-rw-------  1 user user  220 May 20 08:00 ${C.dim('.bash_history')}
-rw-r--r--  1 user user 3526 May 20 08:00 ${C.dim('.bashrc')}
` : ''}-rw-r--r--  1 user user   42 May 21 09:10 ${C.green('flag.txt')}
-rw-r--r--  1 user user  128 May 21 09:00 ${C.green('notes.txt')}
-rwsr-xr-x  1 root root 8192 May 20 10:00 ${C.red('vuln_suid')}
drwxr-xr-x  2 user user 4096 May 21 09:00 ${C.cyan('scripts/')}`
    }

    return `${showHidden ? '.bash_history  .bashrc  ' : ''}flag.txt  notes.txt  ${C.red('vuln_suid')}  scripts/`
  },

  id: (_args, _ctx) => {
    return `uid=1000(user) gid=1000(user) groups=1000(user),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev)`
  },

  whoami: (_args, _ctx) => `user`,

  uname: (args, _ctx) => {
    if (args.includes('-a')) {
      return `Linux vaathi-lab 5.15.0-76-generic #83-Ubuntu SMP Thu Jun 15 19:16:32 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux`
    }
    return `Linux`
  },

  ifconfig: (_args, _ctx) => {
    return `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 10.10.10.15  netmask 255.255.255.0  broadcast 10.10.10.255
        inet6 fe80::a00:27ff:fe4e:66a1  prefixlen 64  scopeid 0x20<link>
        ether 08:00:27:4e:66:a1  txqueuelen 1000  (Ethernet)
        RX packets 1234  bytes 987654 (964.5 KiB)
        TX packets 891  bytes 654321 (639.0 KiB)

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)`
  },

  ip: (args, _ctx) => {
    const subcommand = args[0] || 'addr'
    if (subcommand === 'addr' || subcommand === 'a') {
      return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
    inet6 ::1/128 scope host
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP
    link/ether 08:00:27:4e:66:a1 brd ff:ff:ff:ff:ff:ff
    inet 10.10.10.15/24 brd 10.10.10.255 scope global dynamic eth0
    inet6 fe80::a00:27ff:fe4e:66a1/64 scope link`
    }
    if (subcommand === 'route' || subcommand === 'r') {
      return `default via 10.10.10.1 dev eth0 proto dhcp src 10.10.10.15 metric 100
10.10.10.0/24 dev eth0 proto kernel scope link src 10.10.10.15`
    }
    return `Usage: ip [ OPTIONS ] OBJECT { COMMAND | help }
OBJECT := { link | address | route | rule | neigh }`
  },

  iptables: (args, _ctx) => {
    if (args.includes('-L') || args.includes('--list')) {
      return `Chain INPUT (policy ACCEPT)
target     prot opt source               destination
ACCEPT     tcp  --  anywhere             anywhere             tcp dpt:ssh
ACCEPT     tcp  --  anywhere             anywhere             tcp dpt:http
ACCEPT     tcp  --  anywhere             anywhere             tcp dpt:https
DROP       tcp  --  anywhere             anywhere             tcp dpt:3306
LOG        all  --  anywhere             anywhere             LOG level warning prefix "INPUT: "

Chain FORWARD (policy DROP)
target     prot opt source               destination

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination`
    }
    return `iptables: requires root privileges for modifications. Showing read-only view.
Use: iptables -L to list rules`
  },

  tcpdump: (args, _ctx) => {
    const iface = args.find((a, i) => args[i - 1] === '-i') || 'eth0'
    const filter = args.filter((a) => !a.startsWith('-') && a !== iface).join(' ')

    return `tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on ${iface}, link-type EN10MB (Ethernet), snapshot length 262144 bytes
${new Date().toISOString().slice(11, 19)}.123456 IP 10.10.10.5.52340 > 10.10.10.15.80: Flags [S], seq 1234567890, win 64240, length 0
${new Date().toISOString().slice(11, 19)}.123789 IP 10.10.10.15.80 > 10.10.10.5.52340: Flags [S.], seq 987654321, ack 1234567891, win 65535, length 0
${new Date().toISOString().slice(11, 19)}.124102 IP 10.10.10.5.52340 > 10.10.10.15.80: Flags [.], ack 1, win 502, length 0
${new Date().toISOString().slice(11, 19)}.124455 IP 10.10.10.5.52340 > 10.10.10.15.80: Flags [P.], seq 1:78, ack 1, win 502, length 77: HTTP: GET / HTTP/1.1
${C.dim(filter ? `[Filter active: "${filter}"]` : '')}
^C
4 packets captured, 4 packets received by filter, 0 packets dropped by kernel`
  },

  clear: (_args, _ctx) => '\x1b[2J\x1b[H',
}

export const COMMAND_HELP: Record<string, string> = {
  nmap: 'Network scanner: nmap -sV -sC target',
  ping: 'ICMP echo: ping -c 4 target',
  netstat: 'Network connections: netstat -tulpn',
  ss: 'Socket statistics: ss -tulpn',
  curl: 'HTTP client: curl -I http://target',
  wget: 'Download files: wget http://target/file',
  whois: 'Domain info: whois example.com',
  dig: 'DNS lookup: dig A example.com',
  host: 'DNS resolution: host example.com',
  traceroute: 'Route tracing: traceroute 8.8.8.8',
  base64: 'Encode/decode: base64 -d encoded_string',
  openssl: 'Crypto tools: openssl rand -hex 16',
  python3: 'Python: python3 -c "print(\'hello\')"',
  echo: 'Print text: echo "hello world"',
  cat: 'Read files: cat /etc/passwd',
  ls: 'List files: ls -la',
  id: 'Show current user ID',
  whoami: 'Show current username',
  uname: 'System info: uname -a',
  ifconfig: 'Network interfaces',
  ip: 'IP address/route: ip addr',
  iptables: 'Firewall rules: iptables -L',
  tcpdump: 'Capture packets: tcpdump -i eth0',
}
