# trx-parser 🧹

> This Action was inspired by https://github.com/zyborg/dotnet-tests-report

[![Build](https://github.com/NasAmin/trx-parser/workflows/Build/badge.svg?branch=main)](https://github.com/NasAmin/trx-parser/actions?workflow=Build)
[![Test](https://github.com/NasAmin/trx-parser/workflows/Test/badge.svg?branch=main)](https://github.com/NasAmin/trx-parser/actions?workflow=Test)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/NasAmin/trx-parser)](https://github.com/NasAmin/trx-parser/releases/latest)
---

This GitHub Action provides a way of parsing dotnet test results from trx files in a given directory. The action will find trx files specified in the `TRX-PATH` input variable. This path must be accessible to the action.

It will read each individual .trx file. Loads up its data and converts it to a typed json object to make it easier to traverse through the data.
For each TRX, it will create a Github Status check and generate a markup report for each trx. The report name and title are derived from the trx file using the `data.TestRun.TestDefinitions.UnitTest[0]._storage`

## Usage

To make `trx-parser` a part of your workflow, just add the following to your existing workflow file in your `.github/workflows/` directory in your GitHub repository.

```yml
name: Test
on: [pull_request]

jobs:
  Build:
    runs-on: ubuntu-latest
    steps:
      # Replace this whichever way you build your code
      - name: Build & Test dotnet code
        run: |
          dotnet restore
          dotnet build -c Release no-restore
          dotnet test -c Release --no-restore --no-build --loger trx --results-directory ./TestResults
      # Using the trx-parser action
      - name: Parse Trx files
        uses: NasAmin/trx-parser@v0.0.1
        id: trx-parser
        with:
          TRX_PATH: ${{ github.workspace }}/TestResults #This should be the path to your TRX files
          REPO_TOKEN: ${{ secrets.GITHUB_TOKEN }}          
```

## Contributing
Anyone is welcome to contribute and make this action better. Please fork the repository and create a pull request with proposed changes.

### Development
* Clone this repository
* Run `npm run build` and `npm run test`
* Run `npm run all` to regenerate the dist directory.
