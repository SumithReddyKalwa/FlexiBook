import os

frontend_dir = r"c:\Users\91955\Downloads\slot-booking-main\slot-booking-main\frontend"
files = ["index.html", "slots.html", "booked.html", "book.html"]

for filename in files:
    filepath = os.path.join(frontend_dir, filename)
    with open(filepath, "r") as f:
        content = f.read()
    
    content = content.replace("<span>Dashboard</span>", "<span>Home</span>")
    
    with open(filepath, "w") as f:
        f.write(content)
