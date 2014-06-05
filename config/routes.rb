PeoplesSolar::Application.routes.draw do
  resources :goals

  resources :notifications

  resources :reports

  root :to => 'visitors#new'
end
