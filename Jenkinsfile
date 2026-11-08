pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    timestamps()
  }

  stages {
    stage('Checkout') {
      steps {
        echo 'Code récupéré'
      }
    }

    stage('Install') {
      agent {
        docker { image 'node:24-alpine'; reuseNode true }
      }
      steps {
        sh 'npm install'
      }
    }

    stage('Security') {
      parallel {
        stage('Gitleaks') {
          steps {
            sh 'docker run --rm -v "$PWD:/repo" ghcr.io/gitleaks/gitleaks:latest git /repo --verbose || true'
          }
        }
          stage('Semgrep') {
          steps {
            sh 'cd src && npx semgrep --config p/javascript --config p/owasp-top-ten --error . || true'
          }
        }
        stage('npm audit') {
          steps {
            sh 'npm audit --audit-level=high || true'
          }
        }
      }
    }

    stage('Build') {
      steps {
        sh 'docker build -t vuln-app:jenkins .'
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
    }
    success {
      echo 'Pipeline réussi'
    }
    failure {
      echo 'Pipeline échoué (faille détectée)'
    }
    cleanup {
      cleanWs()
    }
  }
}
