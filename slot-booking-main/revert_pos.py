import os

frontend_dir = r"c:\Users\91955\Downloads\slot-booking-main\slot-booking-main\frontend"
files = ["index.html", "slots.html", "booked.html", "book.html"]
css_file = os.path.join(frontend_dir, "css", "style.css")

# Update HTML files
for filename in files:
    filepath = os.path.join(frontend_dir, filename)
    with open(filepath, "r") as f:
        content = f.read()
    
    # Revert to container layout and update FlexiBook
    content = content.replace('<div class="nav-wrap">', '<div class="container nav-wrap">')
    content = content.replace('Flexibook', 'FlexiBook')
    
    with open(filepath, "w") as f:
        f.write(content)

# Update CSS file
with open(css_file, "r") as f:
    css_content = f.read()

# Revert nav-wrap padding and width
css_old = """.nav-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 40px;
    width: 100%;
}"""
css_new = """.nav-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 0;
}"""

css_content = css_content.replace(css_old, css_new)

with open(css_file, "w") as f:
    f.write(css_content)
