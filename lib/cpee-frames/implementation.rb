#!/usr/bin/ruby
#
# This file is part of CPEE-FRAMES.
#
# CPEE-FRAMES is free software: you can redistribute it and/or modify it under
# the terms of the GNU General Public License as published by the Free Software
# Foundation, either version 3 of the License, or (at your option) any later
# version.
#
# CPEE-FRAMES is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
# details.
#
# You should have received a copy of the GNU General Public License along with
# CPEE-FRAMES (file LICENSE in the main directory). If not, see
# <http://www.gnu.org/licenses/>.

require 'rubygems'
require 'json'
require 'xml/smart'
require 'riddl/server'
require 'fileutils'
require 'typhoeus'

module CPEE

  module Frames

    SERVER = File.expand_path(File.join(__dir__,'implementation.xml'))

    def self::overlap?(l1x, l1y, r1x, r1y, l2x, l2y, r2x, r2y)
      if l1x > r2x || l2x > r1x
          return false
      end
      if l1y > r2y || l2y > r1y
          return false
      end
      return true
    end

    def self::target?(l1x, l1y, r1x, r1y, l2x, l2y, r2x, r2y)
      return l1x == l2x && l1y == l2y && r1x == r2x && r1y == r2y
    end

    # https://coderwall.com/p/atyfyq/ruby-string-to-boolean
    # showbutton
    refine String do #{{{
      def to_bool
        return true if self == true || self =~ (/(true|t|yes|y|1)$/i)
        return false if self == false || self.empty? || self =~ (/(false|f|no|n|0)$/i)
        raise ArgumentError.new("invalid value for Boolean: \"#{self}\"")
      end
    end #}}}

    class GetTutorial < Riddl::Implementation #{{{
      def response
        Riddl::Parameter::Complex.new('ui','text/html',File.open(File.join(__dir__,'ui','tutorial.html')))
      end
    end #}}}

    class GetAllConfigs < Riddl::Implementation #{{{
      def response
        data_dir = @a[0]
        databack = JSON::pretty_generate(Dir.glob(File.join(data_dir,'*')).map{|f| File.basename(f)}.sort_by{|x| x.downcase})
        Riddl::Parameter::Complex.new('list','application/json',databack)
      end
    end #}}}

    class Get < Riddl::Implementation #{{{
      def response
        Riddl::Parameter::Complex.new('ui','text/html',File.open(File.join(__dir__,'ui','template.html')))
      end
    end #}}}

    class InitFrame < Riddl::Implementation #{{{
      def response
        data_dir = @a[1]
        Dir.mkdir(File.join(data_dir,@r.last)) rescue nil

        if !@p[0].value.to_s.empty?
          File.write(File.join(data_dir,@r.last,'style.url'),@p[0].value)
        end

        File.write(File.join(data_dir,@r.last,'frames.json'),JSON.dump(JSON.parse('{"data":[]}')))

        #for handler
        File.write(File.join(data_dir,@r.last,'dataelements.json'),JSON.dump(JSON.parse('{"data":[]}')))

        File.write(File.join(data_dir,@r.last,'info.json'),JSON.dump(JSON.parse('{"x_amount":' + @p[2].value + ', "y_amount":' + @p[3].value + ', "lang":"' + @p[4].value  + '", "langs":["' + @p[4].value +  '"], "document_name": "' + @p[5].value + '"}')))

        File.write(File.join(data_dir,@r.last,'callback'),@h['CPEE_CALLBACK'])
        File.write(File.join(data_dir,@r.last,'cpeeinstance.url'),@h['CPEE_INSTANCE_URL'])

        @a[0].send(JSON.dump({ message: 'new' }))
        nil
      end
    end #}}}

    class NewFrameSet < Riddl::Implementation #{{{
      def response
        data_dir = @a[1]
        path = File.join(data_dir,@r.last,'frames.json')
        file = File.read(path)
        data_hash = JSON::parse(file)

        # check if new frame overlaps others if it does, delete overlapped frames
        data_hash["data"].each do | c |
          if CPEE::Frames::overlap?(c['lx'], c['ly'], c['rx'], c['ry'], @p[1].value.to_i, @p[2].value.to_i, (@p[1].value.to_i + @p[3].value.to_i - 1), (@p[2].value.to_i + @p[4].value.to_i - 1))
            data_hash["data"].delete(c)
          end
        end

        #check if url is set
        if @p[5].value != ""
          urls = JSON::parse(@p[5].value);

          if @p[6].value == ""
            hash = {lx: @p[1].value.to_i, ly: @p[2].value.to_i, rx: (@p[1].value.to_i + @p[3].value.to_i - 1), ry: (@p[2].value.to_i + @p[4].value.to_i - 1), url: urls, default: "{}", callback: @h['CPEE_CALLBACK']};
          else
            hash = {lx: @p[1].value.to_i, ly: @p[2].value.to_i, rx: (@p[1].value.to_i + @p[3].value.to_i - 1), ry: (@p[2].value.to_i + @p[4].value.to_i - 1), url: urls, default: JSON::parse(@p[6].value), callback: @h['CPEE_CALLBACK']};
          end

          data_hash['data'].push(hash)
          File.write(path, JSON.dump(data_hash))

          # only send active url to client
          infofile = File.join(data_dir,@r.last,'info.json')
          infojson = JSON::parse(File.read(infofile))
          hash["url"] = urls.find{ |h| h['lang'] == infojson["lang"]}['url']

          @a[0].send(JSON.dump({ message: 'display', content: hash }))
        else
          File.write(path, JSON.dump(data_hash))
          hash = {lx: @p[1].value.to_i, ly: @p[2].value.to_i, rx: (@p[1].value.to_i + @p[3].value.to_i - 1), ry: (@p[2].value.to_i + @p[4].value.to_i - 1), url: "empty", default: "{}", callback: @h['CPEE_CALLBACK']};

          @a[0].send(JSON.dump({ message: 'display', content: hash }))
        end

        nil
      end
    end #}}}

    class NewFrameWait < Riddl::Implementation #{{{NewFrameWait
      def response
        data_dir = @a[1]
        path = File.join(data_dir,@r.last,'frames.json')
        file = File.read(path)
        data_hash = JSON::parse(file)

        # check if new frame overlaps others if it does, delete overlapped frames
        data_hash["data"].each do | c |
          if CPEE::Frames::overlap?(c['lx'], c['ly'], c['rx'], c['ry'], @p[1].value.to_i, @p[2].value.to_i, (@p[1].value.to_i + @p[3].value.to_i - 1), (@p[2].value.to_i + @p[4].value.to_i - 1))
            data_hash["data"].delete(c)
          end
        end

        # check if url is set
        if @p[5].value != ""
          urls = JSON::parse(@p[5].value);
          if @p[6].value == ""
            hash = {lx: @p[1].value.to_i, ly: @p[2].value.to_i, rx: (@p[1].value.to_i + @p[3].value.to_i - 1), ry: (@p[2].value.to_i + @p[4].value.to_i - 1), url: urls, default: "{}", callback: @h['CPEE_CALLBACK']};
          else
            hash = {lx: @p[1].value.to_i, ly: @p[2].value.to_i, rx: (@p[1].value.to_i + @p[3].value.to_i - 1), ry: (@p[2].value.to_i + @p[4].value.to_i - 1), url: urls, default: JSON::parse(@p[6].value), callback: @h['CPEE_CALLBACK']};
          end
          data_hash['data'].push(hash)
          File.write(path, JSON.dump(data_hash))

          # only send active url to client
          infofile = File.join(data_dir,@r.last,'info.json')
          infojson = JSON::parse(File.read(infofile))
          hash["url"] = urls.find{ |h| h['lang'] == infojson["lang"]}['url']

          File.write(File.join(data_dir,@r.last,'callback'),@h['CPEE_CALLBACK'])

          @a[0].send(JSON.dump({ message: 'display', content: hash }))
        else
          File.write(path, JSON.dump(data_hash))
          hash = {lx: @p[1].value.to_i, ly: @p[2].value.to_i, rx: (@p[1].value.to_i + @p[3].value.to_i - 1), ry: (@p[2].value.to_i + @p[4].value.to_i - 1), url: "empty", default: "{}", callback: @h['CPEE_CALLBACK']};

          File.write(File.join(data_dir,@r.last,'callback'),@h['CPEE_CALLBACK'])


          @a[0].send(JSON.dump({ message: 'display', content: hash }))

          Typhoeus.put(@h['CPEE_CALLBACK'], body: "No Frame Set")
        end
        nil

      end
      def headers
        Riddl::Header.new('CPEE-CALLBACK', 'true')
      end
    end #}}}

    class SendDataToFrame < Riddl::Implementation #{{{NewFrameWait
      def response
        data_dir = @a[1]
        path = File.join(data_dir,@r.last,'frames.json')
        file = File.read(path)
        data_hash = JSON::parse(file)

        # check if new frame overlaps others if it does, delete overlapped frames
        data_hash["data"].each do | c |
          if CPEE::Frames::target?(c['lx'], c['ly'], c['rx'], c['ry'], @p[1].value.to_i, @p[2].value.to_i, (@p[1].value.to_i + @p[3].value.to_i - 1), (@p[2].value.to_i + @p[4].value.to_i - 1))
            @a[0].send(JSON.dump({ message: 'update', content: { 'callback' => c['callback'], 'data' => @p[5].value.strip == '' ? {} : JSON::parse(@p[5].value) }}))
          end
        end

        nil
      end
    end #}}}

    class DeleteFrame < Riddl::Implementation #{{{
      def response
        data_dir = @a[1]
        path = File.join(data_dir,@r.last,'frames.json')
        file = File.read(path)
        data_hash = JSON::parse(file)

        data_hash["data"].each do | c |
          if CPEE::Frames::overlap?(c['lx'], c['ly'], c['rx'], c['ry'], @p[0].value.to_i, @p[1].value.to_i, (@p[0].value.to_i + 1), (@p[1].value.to_i + 1))
            data_hash["data"].delete(c)
          end
        end

        File.write(path, JSON.dump(data_hash))
      end
    end #}}}

    class Delete < Riddl::Implementation #{{{
      def response
        data_dir = @a[1]
        pp "in delete"
        if cbu = File.read(File.join(data_dir,@r.last,'callback'))
          send = { 'operation' => @p[0].value }
          case send['operation']
            when 'result'
              send['target'] = JSON::parse(@p[1].value.read)
          end
          cbu += '/' unless cbu[-1] == '/'
          pp "Sending"
          Typhoeus.put(cbu, body: JSON::generate(send), headers: { 'content-type' => 'application/json'})
        end

        # File.unlink(File.join(data_dir,@r.last,'callback')) rescue nil
        # File.unlink(File.join(data_dir,@r.last,'cpeeinstance.url')) rescue nil
        # File.unlink(File.join(data_dir,@r.last,'style.url')) rescue nil
        # File.unlink(File.join(data_dir,@r.last,'document.xml')) rescue nil
        # File.unlink(File.join(data_dir,@r.last,'info.json')) rescue nil

        @a[0].send(JSON.dump({ message: 'reset' }))
        nil
      end
    end #}}}

    class GetFrames < Riddl::Implementation #{{{
      def response
        data_dir = @a[0]
        fname = File.join(data_dir,@r[-2],'frames.json')
        if File.exist? fname

          infofile = File.join(data_dir,@r[-2],'info.json')
          infojson = JSON::parse(File.read(infofile))

          # remove not used languages
          file = JSON::parse(File.read(fname))

          file["data"].each do |child|
            child["url"] = child["url"].find{ |h| h['lang'] == infojson["lang"]}['url']
          end

          Riddl::Parameter::Complex.new('value','application/json',JSON.dump(file))
        else
          @status = 404
        end
      end
    end #}}}

    class SetDataElements < Riddl::Implementation #{{{
      def response
        data_dir = @a[0]
        savejson = @p.map { |o| Hash[o.name, o.value] }.to_json
        path = File.join(data_dir,@r[0],'dataelements.json')
        File.write(path, savejson)

        #puts xyz

        #puts JSON.pretty_generate(@p.to_json)



        #puts @p.length()
        #puts @p[0].name
        #puts @p[0].value

        #fname = File.join(data_dir,@r[-2],'dataelements.json')
        #if File.exist? fname
        #  Riddl::Parameter::Complex.new('value','application/json',File.read(fname))
        #else
        #  @status = 404
        #end
      end
    end #}}}

    class GetDataElements < Riddl::Implementation #{{{
      def response
        data_dir = @a[0]
        fname = File.join(data_dir,@r[-2],'dataelements.json')
        if File.exist? fname
          Riddl::Parameter::Complex.new('value','application/json',File.read(fname))
        else
          @status = 404
        end
      end
    end #}}}

    class GetInfo < Riddl::Implementation #{{{
      def response
        data_dir = @a[0]
        fname = File.join(data_dir,@r[-2],'info.json')
        if File.exist? fname
          Riddl::Parameter::Complex.new('value','application/json',File.read(fname))
        else
          @status = 404
        end
      end
    end #}}}

    class GetLangs < Riddl::Implementation #{{{
      def response
        data_dir = @a[0]
        fname = File.join(data_dir,@r[-2],'info.json')
        if File.exist? fname
          infojson = JSON::parse(File.read(fname))
          Riddl::Parameter::Complex.new('value','application/json',JSON::generate(infojson["langs"]))
        else
          @status = 404
        end
      end
    end #}}}

    class SetLang < Riddl::Implementation #{{{
      def response
        data_dir = @a[1]
        fname = File.join(data_dir,@r[-2],'info.json')
        if File.exist? fname
          infojson = JSON::parse(File.read(fname))
          infojson["lang"] = @p[0].value


          #add to langs
          if !infojson["langs"].include?(@p[0].value)
            infojson["langs"].push(@p[0].value)
          end

          File.write(fname, JSON.dump(infojson))



          @a[0].send(JSON.dump({ message: 'reset' }))
          nil
        else
          @status = 404
        end
      end
    end #}}}

    class GetStyle < Riddl::Implementation #{{{
      def response
        data_dir = @a[0]
        fname = File.join(data_dir,@r[-2],'style.url')
        if File.exist? fname
          Riddl::Parameter::Complex.new('url','text/plain',File.read(fname).strip)
        else
          @status = 404
        end
      end
    end #}}}

    class GetCpeeInstance < Riddl::Implementation #{{{
      def response
        data_dir = @a[0]
        fname = File.join(data_dir,@r[-2],'cpeeinstance.url')
        if File.exist? fname
          Riddl::Parameter::Complex.new('url','text/plain',File.read(fname).strip)
        else
          @status = 404
        end
      end
    end #}}}

    class Handler < Riddl::Implementation #{{{
      def response
        data_dir      = @a[1]
        topic         = @p[1].value
        event_name    = @p[2].value
        notification  = JSON.parse(@p[3].value.read)

        instancenr = notification['instance']
        content = notification['content']
        activity = content['activity']
        parameters = content['parameters']
        receiving = content['received']

        if content['values']&.any?
          #puts alldata['ausfuehrungen']
          puts "writing file"
          path = File.join(data_dir,@r[0],'dataelements.json')
          File.write(path, JSON.dump(content['values']))
        end

        @a[0].send(JSON.dump({ message: @r[0] }))
        nil
      end
    end #}}}

    class SSE < Riddl::SSEImplementation #{{{
      def onopen
        signals = @a[0]
        signals.add self
        send JSON.dump({ message: 'started' })
        true
      end

      def onclose
        signals = @a[0]
        signals.remove self
        nil
      end
    end #}}}

    class SSE_Handler < Riddl::SSEImplementation #{{{
      def onopen
        signals = @a[0]
        signals.add self
        send JSON.dump({ message: 'started' })
        true
      end

      def onclose
        signals = @a[0]
        signals.remove self
        nil
      end
    end #}}}

    class Signaling # {{{
      def initialize
        @binding = []
      end

      def add(binding)
        @binding << binding
      end
      def remove(binding)
        @binding.delete(binding)
      end
      def length
        @binding.length
      end

      def send(value)
        @binding.each do |b|
          b.send(value)
        end
      end
    end #}}}

    def self::implementation(opts)
      opts[:signals] = {}
      opts[:signals2] = {}
      opts[:data_dir] ||= File.expand_path(File.join(__dir__,'data'))

      Proc.new do
        parallel do
          loop do
            opts[:signals].each do |k,v|
              v.send(JSON.dump({ message: 'keepalive' }))
            end
            opts[:signals2].each do |k,v|
              v.send(JSON.dump({ message: 'keepalive' }))
            end
            sleep 5
          end
        end

        on resource do
          run GetTutorial if get

          on resource 'getConfigs' do
            run GetAllConfigs, opts[:data_dir] if get
          end

          on resource do |r|
            idx = r[:r][0]
            opts[:signals][idx] ||= Signaling.new
            opts[:signals2]["handler"] ||= Signaling.new

            run Get if get
            run InitFrame, opts[:signals][idx], opts[:data_dir] if post 'input'

            run NewFrameSet, opts[:signals][idx], opts[:data_dir] if put 'sframe'
            run NewFrameWait, opts[:signals][idx], opts[:data_dir] if put 'wframe'
            run SendDataToFrame, opts[:signals][idx], opts[:data_dir] if put 'uframe'

            run DeleteFrame, opts[:signals][idx], opts[:data_dir] if post 'deleteframe'

            on resource 'handler' do
              run Handler, opts[:signals2]["handler"], opts[:data_dir] if post
              on resource 'sse' do
                run SSE_Handler, opts[:signals2]["handler"] if sse
              end
            end

            run Delete, opts[:signals][idx], opts[:data_dir] if delete 'opa'
            run Delete, opts[:signals][idx], opts[:data_dir] if delete 'opb'
            run Delete, opts[:signals][idx], opts[:data_dir] if delete 'opc'
            on resource 'sse' do
              run SSE, opts[:signals][idx] if sse
            end
            on resource 'languages' do
              run GetLangs, opts[:data_dir] if get
              run SetLang, opts[:signals][idx], opts[:data_dir] if post 'lang'
            end
            on resource 'cpeeinstance.url' do
              run GetCpeeInstance, opts[:data_dir] if get
            end
            on resource 'style.url' do
              run GetStyle, opts[:data_dir] if get
            end
            on resource 'info.json' do
              run GetInfo, opts[:data_dir] if get
            end
            on resource 'frames.json' do
              run GetFrames, opts[:data_dir] if get
            end

            on resource 'dataelements.json' do
              run SetDataElements, opts[:data_dir] if post
              run GetDataElements, opts[:data_dir] if get
            end
          end
        end
      end
    end

  end
end
