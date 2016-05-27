(defproject caldo "1.0.0"
  :description "a tetris-like language game"
  :url "https://caldo.verbcoach.com"
  :license {:name "GPL 3"
            :url "http://gnu.org/"}
  :dependencies [[babel "1.4.5-SNAPSHOT"]
                 [dag_unify "1.1.1"]
                 [log4j/log4j "1.2.16"]
                 [org.clojure/clojure "1.7.0"]
                 [org.clojure/data.json "0.2.5"]
                 [org.clojure/tools.logging "0.2.6"]
                 [org.clojure/tools.nrepl "0.2.7"]]

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




