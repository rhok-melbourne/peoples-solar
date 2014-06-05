json.array!(@notifications) do |notification|
  json.extract! notification, :id, :message, :value
  json.url notification_url(notification, format: :json)
end
