json.array!(@goals) do |goal|
  json.extract! goal, :id, :current, :target
  json.url goal_url(goal, format: :json)
end
