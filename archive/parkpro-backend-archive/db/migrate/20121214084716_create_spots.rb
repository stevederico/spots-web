class CreateSpots < ActiveRecord::Migration
  def change
    create_table :spots do |t|
      t.string :city
      t.boolean :isAvailable
      t.float :latitude
      t.float :longitude
      t.float :price
      t.string :state
      t.string :streetAddress
      t.text :summary
      t.integer :zipcode

      t.timestamps
    end
  end
end
