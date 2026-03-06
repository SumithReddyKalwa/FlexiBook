import os
import re

frontend_dir = r"c:\Users\91955\Downloads\slot-booking-main\slot-booking-main\frontend"
css_file = os.path.join(frontend_dir, "css", "style.css")

with open(css_file, "r") as f:
    css_content = f.read()

# Replace dashboard layout CSS
css_new = re.sub(
    r"\/\* Dashboard Layout \*\/.*?\.page-home \{",
    """/* Dashboard Layout (Topbar) */
.topbar {
    background: rgba(30, 41, 59, 0.7);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    position: sticky;
    top: 0;
    z-index: 20;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
}

.nav-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 0;
}

.brand {
    color: var(--text);
    text-decoration: none;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 0.2px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.dot {
    width: 12px;
    height: 12px;
    border-radius: 999px;
    background: var(--primary);
    display: inline-block;
    box-shadow: 0 0 12px var(--primary);
}

.nav-links {
    display: flex;
    align-items: center;
    gap: 12px;
}

.nav-links a {
    color: var(--muted);
    text-decoration: none;
    padding: 10px 16px;
    border-radius: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
}

.nav-links a svg {
    width: 18px;
    height: 18px;
}

.nav-links a.active,
.nav-links a:hover {
    background: rgba(59, 130, 246, 0.1);
    color: var(--primary);
}

.page-home {""",
    css_content,
    flags=re.DOTALL
)

# Replace media queries at the bottom
css_new = re.sub(
    r"@media \(max-width: 900px\).*?\}$",
    """@media (max-width: 760px) {
    .brand {
        font-size: 19px;
    }

    .nav-wrap {
        flex-direction: column;
        align-items: flex-start;
    }

    .nav-links {
        width: 100%;
        flex-wrap: wrap;
        gap: 6px;
    }

    .page-title-row {
        flex-direction: column;
        align-items: flex-start;
    }

    .page-title-row h1 {
        font-size: 32px;
    }

    .slot-time {
        font-size: 28px;
    }
}""",
    css_new,
    flags=re.DOTALL
)

with open(css_file, "w") as f:
    f.write(css_new)


header_template = """<header class="topbar">
        <div class="container nav-wrap flex-nav">
            <a class="brand" href="/">
                <span class="dot"></span>
                SlotBooking
            </a>
            <nav class="nav-links">
                <a href="/" {active_idx}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                    <span>Dashboard</span>
                </a>
                <a href="/slots.html" {active_slots}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    <span>Slots</span>
                </a>
                <a href="/booked.html" {active_booked}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                    </svg>
                    <span>My Bookings</span>
                </a>
                <a class="btn btn-secondary btn-small" id="logoutBtn" href="#">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 16px; margin-right: 6px;">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    Logout
                </a>
            </nav>
        </div>
    </header>"""

files = [
    ("index.html", 'class="active"', '', ''),
    ("slots.html", '', 'class="active"', ''),
    ("booked.html", '', '', 'class="active"'),
    ("book.html", '', '', '')
]

for filename, a1, a2, a3 in files:
    filepath = os.path.join(frontend_dir, filename)
    with open(filepath, "r") as f:
        content = f.read()
    
    # replace aside sidebar
    header_html = header_template.format(active_idx=a1, active_slots=a2, active_booked=a3)
    content = re.sub(r"<aside class=\"sidebar\">.*?</aside>", header_html, content, flags=re.DOTALL)
    
    # replace body class
    content = content.replace('body class="dashboard-layout"', 'body')
    
    # replace main class
    content = content.replace('main class="main-content ', 'main class="container ')
    
    with open(filepath, "w") as f:
        f.write(content)
