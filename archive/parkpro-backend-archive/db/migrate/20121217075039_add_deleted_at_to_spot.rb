class AddDeletedAtToSpot < ActiveRecord::Migration
  def change
    add_column :spots, :deleted_at, :datetime
  end
end
