class CreateGoals < ActiveRecord::Migration
  def change
    create_table :goals do |t|
      t.integer :current
      t.integer :target

      t.timestamps
    end
  end
end
