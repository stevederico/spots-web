class ApplicationController < ActionController::Base
  protect_from_forgery

  layout :layout_by_resource

  protected

  def after_sign_in_path_for(resource)
 	spots_path
  end

  def layout_by_resource
    if devise_controller?
      false
    else
      "application"
    end

 

  end


end
