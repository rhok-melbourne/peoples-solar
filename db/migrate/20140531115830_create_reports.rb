class CreateReports < ActiveRecord::Migration
  def change
    create_table :reports do |t|
      t.integer :consumption
      t.integer :production

      t.timestamps
    end
  end
end
