#!/bin/bash
# Usage: bash publish.sh --build-only --emit

set -e # -x
dir=$(pwd)
bash_args="$@"
prefix="@block-kit"
# npm version patch --no-git-tag-version
version=$(echo "console.log(require(\"../../package.json\").version)" | node)
vars_version=$(echo "console.log(require(\"./package.json\").version)" | node)

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

echo_notice "Editor Version: $version"
echo_notice "Publish Version: $vars_version"

if ! check_argument "--emit" || check_argument "--build-only"; then
  echo_notice "Notice: Current Version Will Not Publish To NPM"
fi

rm -rf dist
npm run build

if check_argument "--build-only"; then
  exit 0
fi

echo "const fs = require('fs');
  const json = require('./package.json');
  const dep = json.dependencies || {};
  for(const [key, value] of Object.entries(dep)) {
    if(key.startsWith('$prefix')) dep[key] = '^$version';
  }
  fs.writeFileSync('./package.json', JSON.stringify(json, null, 2));
" | node
set +e
if check_argument "--emit"; then
  npm publish --registry=https://registry.npmjs.org/ --access public
else
  npm publish --registry=https://registry.npmjs.org/ --dry-run
fi

echo "const fs = require('fs');
  const json = require('./package.json');
  const dep = json.dependencies || {};
  for(const [key, value] of Object.entries(dep)) {
    if(key.startsWith('$prefix')) dep[key] = 'workspace: *';
  }
  fs.writeFileSync('./package.json', JSON.stringify(json, null, 2));
" | node