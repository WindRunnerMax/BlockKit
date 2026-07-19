#!/bin/bash
# Usage: bash publish.sh --build-only --emit --skip-login

set -e # -x
dir=$(pwd)
bash_args="$@"
dist_dir="dist"
prefix="@block-kit"
packages=(utils delta core react plugin)
# npm version patch --no-git-tag-version
version=$(echo "console.log(require(\"./package.json\").version)" | node)
export BUILD_VERSION=$version

function check_argument {
  local value=$1
  for arg in $bash_args; do
    if [ "$arg" == "$value" ]; then
      return 0 # success
    fi
  done
  return 1 # failure
}

function echo_notice {
  local value=$1
  echo -e "\033[32m$value\033[0m"
}

echo_notice "Version: $version"

if ! check_argument "--emit" || check_argument "--build-only"; then
  echo_notice "Notice: Current Version Will Not Publish To NPM"
fi

for item in "${packages[@]}"; do
  package="$prefix/$item"
  pnpm --filter "${package}" exec rm -rf $dist_dir
  pnpm run --filter "${package}" build
  pnpm run --filter "${package}" lint:ts
  pnpm run --filter "${package}" test
done

if check_argument "--build-only"; then
  exit 0
fi

if check_argument "--emit" && ! check_argument "--skip-login"; then
  npm login --registry https://registry.npmjs.org/
fi

for item in "${packages[@]}"; do
  path="$dir/packages/$item"
  cache_dir="$path/node_modules/.cache/npm"
  cd $path
  rm -rf $cache_dir
  mkdir -p $cache_dir
  cp -r "$dist_dir" "$cache_dir"
  echo "const fs = require('fs');
      const json = require('./package.json');
      json.version = '$version';
      const dep = json.dependencies || {};
      for(const [key, value] of Object.entries(dep)) {
        if(key.startsWith('$prefix/')) dep[key] = '$version';
      }
      fs.writeFileSync('$cache_dir/package.json', JSON.stringify(json, null, 2));
    " | node
  cd $cache_dir
  if check_argument "--emit"; then
    npm publish --registry=https://registry.npmjs.org/ --access public
  else
    npm publish --registry=https://registry.npmjs.org/ --dry-run
  fi
done
