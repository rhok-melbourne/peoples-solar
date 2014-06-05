People's Solar
========================

```cp dev.env .env```
and populate accordingly with admin db creds

```bundle install && bundle exec rake db:setup && bundle exec rake db:test:prepare```
will create both 'solar' and 'solar_test' databases, create ```db/schema.rb``` migrate and seed
