# Telemetry Documentation

The TRX Parser action includes **vendor-only telemetry** that automatically collects usage and performance metrics for the action maintainer. This telemetry is completely transparent to action users and requires no configuration.

## How It Works

- **Completely automatic**: No configuration required by action users
- **Vendor-only**: Only works in the vendor's repository environment (NasAmin/trx-parser)
- **Zero impact on consumers**: Action users never see telemetry-related logs or errors
- **Privacy-first**: No user data or secrets are collected

## What's Collected (Vendor Only)

### Metrics
- `trx_parser_action_runs_total` - Total number of action runs (labeled by outcome: success/failure)
- `trx_parser_files_processed_total` - Total number of TRX files processed
- `trx_parser_tests_total` - Total number of tests found in TRX files
- `trx_parser_tests_passed` - Total number of passed tests
- `trx_parser_tests_failed` - Total number of failed tests

### Traces
- `trx_parser_action_run` - Overall action execution span
- `find_trx_files` - File discovery operation
- `transform_trx_files` - TRX file parsing operations
- `transform_single_trx_to_json` - Individual TRX file parsing
- `create_check_runs` - GitHub check run creation operations  
- `create_single_check_run` - Individual GitHub check run creation
- `github_check_create` - GitHub API calls for check creation
- `get_trx_files` - File system operations for finding TRX files

## Vendor Configuration

For the action maintainer, telemetry requires these repository secrets:

| Variable | Description |
|----------|-------------|
| `VENDOR_HONEYCOMB_API_KEY` | Honeycomb API key for exporting telemetry data |
| `VENDOR_HONEYCOMB_DATASET` | Optional: Honeycomb dataset name (defaults to 'trx-parser') |

## Security & Privacy

- **No user configuration**: Action users never need to set up telemetry
- **No sensitive data collection**: Tokens, file contents, and personal information are never included
- **Graceful degradation**: Telemetry failures do not affect action functionality for anyone
- **Environment isolation**: Only activates in vendor's own repository
- **Silent operation**: No telemetry-related messages shown to action consumers

## For Action Users

**You don't need to do anything!** This telemetry is completely transparent and automatic. Your usage of the action is exactly the same whether telemetry is enabled or not.

```yaml
- name: Parse TRX files
  uses: NasAmin/trx-parser@v1
  with:
    TRX_PATH: './test-results'
    REPO_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

The action will work identically with or without telemetry, and you'll never see any telemetry-related configuration, logs, or errors.