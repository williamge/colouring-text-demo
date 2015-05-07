git stash
git checkout gh-pages
git pull --rebase origin gh-pages
git merge master
./build.sh
git add main.js main.js.map
git commit -m "Automatic autopublish"
git push origin gh-pages
git checkout master
git stash pop