class AddTypeToSpot < ActiveRecord::Migration
  def change
    add_column :spots, :style, :string
  end
end
