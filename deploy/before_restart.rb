Chef::Log.info('Performing pre-deploy steps..')

bash 'before_deploy' do
  cwd '/srv/www/chess_wrio_game/current'
  user 'root'
  code <<-EOF
    npm install -g gulp
  EOF
end


bash 'after_deploy' do
  cwd '/srv/www/chess_wrio_game/current'
  user 'deploy'
  code <<-EOF
    gulp
  EOF
end
