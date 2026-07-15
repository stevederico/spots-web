class AddOvernightToSpot < ActiveRecord::Migration
  def change
    add_column :spots, :overnight, :float
  end
end
