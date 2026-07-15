class Spot < ActiveRecord::Base
  acts_as_paranoid
  attr_accessible :city,:overnight, :style, :latitude, :longitude, :price, :state, :streetAddress, :summary, :zipcode, :title
  validates_length_of :summary, :minimum => 30,:message => "must be atleast 30 characters."
  validates_format_of :streetAddress, :with => /^[a-z0-9 ]+$/i, :message => "only contain letters and numbers."
  validates_format_of :state, :with => /\A[a-zA-Z\s]+\z/, :message => "is invalid"
  validates_format_of :city, :with => /\A[a-zA-Z\s]+\z/, :message => "is invalid"
  validates_format_of :zipcode, :with => /^\d{5}(-\d{4})?$/, :message => "should be in the form 12345 or 12345-1234"
  validates :price, :format => { :with => /^\d+??(?:\.\d{0,2})?$/ }, :numericality => {:greater_than => 0, :less_than => 100}
  validates_format_of :longitude, :with => /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,6})?|180(?:\.0{1,6})?)$/, :message => "should be in the format
[-]xx.xxxxxxxx"
  validates_format_of :latitude, :with => /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,6})?|180(?:\.0{1,6})?)$/, :message => "should be in the format
[-]xx.xxxxxxxx"
end
