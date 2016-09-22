set -eo pipefail

package_name="$(basename $(pwd))"

git reset HEAD
git add package.json
git commit -m "++$package_name"
git push origin master
