class AddTitleToSpot < ActiveRecord::Migration
  def change
    add_column :spots, :title, :string
  end
end
