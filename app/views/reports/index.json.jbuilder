json.array!(@reports) do |report|
  json.extract! report, :id, :consumption, :production
  json.url report_url(report, format: :json)
end
