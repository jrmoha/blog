module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier"
    ],
    "overrides": [
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint",
        "prettier"
    ],
    "rules": {
        "no-dupe-keys": 2,
        "no-unmodified-loop-condition": 2,
        "no-undef": 1,
        "no-unused-vars": 1,
        "prefer-const": 1,
        "no-var": 2,
        "no-multiple-empty-lines": 1,
        "no-multi-str": 0,
        "no-irregular-whitespace": 0,
        "prettier/prettier": 0,
    }
}
