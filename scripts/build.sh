set -eo pipefail

root_dir="../.."
bin_dir="$root_dir/node_modules/.bin"
tsc="$bin_dir/tsc"

build() {
  dir=$1
  target=$2

  rm -rf "$dir"
  mkdir -p "$dir"

  $tsc \
    --declaration \
    --outDir "$dir" \
    --rootDir "src" \
    --target "$target"
}

build "lib/es5" "es5"
build "lib/es6" "es6"
