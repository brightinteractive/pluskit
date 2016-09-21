set -eo pipefail

package_name="$(basename $(pwd))"

git add .
git commit -m "++$package_name"
git push origin master
