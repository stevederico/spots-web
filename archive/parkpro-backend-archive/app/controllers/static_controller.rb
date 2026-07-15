class StaticController < ApplicationController
	def index
		render :layout => false
	end
	def narrow
		render :layout => false
	end

end
