# TrendDojo Infrastructure Files

## DNS Records

### SendGrid Email Setup
- `sendgrid-dns-records.csv` - Cloudflare CSV import format
- `sendgrid-dns-records.zone` - Standard DNS zone file format
- `trenddojo.com.txt` - Original DNS export from Cloudflare
- `trenddojo.com-merged.txt` - Complete zone file with SendGrid records added

### Usage
1. Add the 6 SendGrid records to Cloudflare manually or via import
2. Records include: url1032, 8516845, em8564, s1._domainkey, s2._domainkey, _dmarc
3. Keep existing records (Google MX, Vercel www CNAME, etc.)

*Generated: 2025-09-06*