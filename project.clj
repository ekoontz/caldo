(defproject caldo "1.0.0-SNAPSHOT"
  :description "the hottest new game"
  :url "https://caldo.verbcoach.com"
  :license {:name "GPL 3"
            :url "http://gnu.org/"}
  :dependencies [[babel "1.4.2"]
                 [dag_unify "1.1.1"]
                 [digest "1.4.4"]
                 [environ "1.0.0"]
                 [friend-oauth2 "0.1.3"]
                 [log4j/log4j "1.2.16" :exclusions [javax.mail/mail
                                                    javax.jms/jms
                                                    com.sun.jdmk/jmxtools
                                                    com.sun.jmx/jmxri]]
                 [http-kit "2.1.16"]
                 [org.apache.httpcomponents/httpclient "4.3.5"]
                 [org.clojure/clojure "1.7.0"]
                 [org.clojure/data.json "0.2.5"]
                 [org.clojure/tools.logging "0.2.6"]
                 [org.clojure/tools.nrepl "0.2.7"]
                 [org.postgresql/postgresql "9.4.1208.jre7"]]


  :plugins [[cider/cider-nrepl "0.11.0"]
            [lein-environ "1.0.0"]
            [lein-ring "0.9.7"]
            [s3-wagon-private "1.2.0"]]
  :repositories {"s3" {:url "s3p://ekoontz-repo/releases/"
                       :username :env/aws_access_key ;; gets environment variable AWS_ACCESS_KEY
                       :passphrase :env/aws_secret_key ;; gets environment variable AWS_SECRET_KEY
                       }}
                 
  :resource-paths ["resources"]
  
  ;; caldo.core/app is defined in src/caldo/core.clj.
  :ring {:handler caldo.caldo/app})




