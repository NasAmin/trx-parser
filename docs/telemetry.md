# Telemetry Documentation

The TRX Parser action now supports optional telemetry using OpenTelemetry SDK with Honeycomb as the backend.

## Configuration

Telemetry is **disabled by default** and requires explicit configuration through environment variables.

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OTEL_ENABLED` | No | `false` | Enable telemetry collection (set to `true` to enable) |
| `HONEYCOMB_API_KEY` | Yes* | - | Honeycomb API key for exporting telemetry data |
| `HONEYCOMB_DATASET` | No | `trx-parser` | Honeycomb dataset name for organizing telemetry data |

*Required only when `OTEL_ENABLED` is `true`

## Usage Example

```yaml
- name: Parse TRX files with telemetry
  uses: NasAmin/trx-parser@v1
  with:
    TRX_PATH: './test-results'
    REPO_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  env:
    OTEL_ENABLED: 'true'
    HONEYCOMB_API_KEY: ${{ secrets.HONEYCOMB_API_KEY }}
    HONEYCOMB_DATASET: 'my-project-tests'
```

## Collected Metrics

The action collects the following metrics:

### Counters
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

## Attributes

Telemetry data includes relevant attributes such as:
- GitHub repository information
- Workflow context
- Test results summary
- File counts and names
- Error messages (for failures)

## Security & Privacy

- Telemetry is completely optional and disabled by default
- No sensitive data (tokens, file contents) is included in telemetry
- API keys are not logged or transmitted in telemetry data
- Telemetry failures do not affect action functionality
- All telemetry is sent securely to Honeycomb via HTTPS

## Troubleshooting

### Telemetry Not Working
1. Ensure `OTEL_ENABLED` is set to `'true'` (as a string)
2. Verify `HONEYCOMB_API_KEY` is correctly set in your repository secrets
3. Check action logs for telemetry initialization messages

### Performance Impact
- Telemetry has minimal performance overhead
- If you experience issues, telemetry can be disabled by removing `OTEL_ENABLED` or setting it to `'false'`

### Honeycomb Setup
1. Create a Honeycomb account at https://honeycomb.io
2. Generate an API key in your Honeycomb settings
3. Add the API key to your repository secrets as `HONEYCOMB_API_KEY`