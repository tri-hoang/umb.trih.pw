# <a href="https://umb.trihoang.net" target="_blank">UMB.trihoang.net</a>'s backend
A simple NodeJS application used to handle API request from <a href="https://umb.trihoang.net" target="_blank">UMB.trihoang.net</a>
`index.js` handles API requests
`read.js` is a one time use program to read scrapped data from <a href="https://github.com/tri-hoang/UMB-Catalog-Reader" target="_blank">UMB Catalog Reader</a>
# Usage
```
# name the scrapped data as courses_newest.txt
python reader.js
# Preferably run main.js in an forever instance
python index.js
```
