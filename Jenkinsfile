#!/usr/bin/env groovy

@Library('tkutils')
import tk.jenkins.common.*
import static tk.jenkins.slack.SlackNotify.notifySlack

def podLabel = UUID.randomUUID().toString()

def gitBranch = 'unknown'

podTemplate(
  label: podLabel,
  yaml: PodSecurityContext.ROOT,
  containers: [
    containerTemplate(
        name: 'node',
        image: 'docker.io/node:14.19.0',
        alwaysPullImage: true,
        ttyEnabled: true,
        command: 'cat',
        workingDir: '/home/jenkins/agent',
        resourceRequestCpu: '500m',
        resourceRequestMemory: '5120Mi',
        resourceLimitMemory: '5120Mi',
    )
  ],
  volumes: [
    secretVolume(mountPath: '/secrets', secretName: 'jenkins-service-account')
  ]
)

{
    node(podLabel) {

        try {
            currentBuild.result = 'SUCCESS'
            gitBranch = GitHelper.getCurrentBranch(this)
            print "checking out '${gitBranch}' branch..."

            stage('checkout') {
                checkout scm
            }

            stage('install') {
                container('node') {
                    sh 'yarn install'
                }
            }

            stage('build') {
                container('node') {
                    sh 'yarn build'
                }
            }

            stage('checks & tests') {
                container('node') {
                    sh 'yarn ci'
                }
            }

            stage('coverage') {
                container('node') {
                    parallel(
                        'unit': {
                            sh 'yarn test:coverage:unit'
                        },
                        'int': {
                            sh 'yarn test:coverage:int'
                        }
                    )
                }
            }
        } catch (any) {
            currentBuild.result = 'FAILURE'
            throw any
        } finally {
            publishHTML(target: [
                allowMissing         : true,
                alwaysLinkToLastBuild: true,
                keepAll              : true,
                reportDir            : './html-reports',
                reportFiles          : 'lint-report.html',
                reportTitles         : 'ESLint',
                reportName           : 'ESLint Report'
            ])

                        publishHTML(target: [
                allowMissing         : true,
                alwaysLinkToLastBuild: true,
                keepAll              : true,
                reportDir            : '.',
                reportFiles          : """packages/payment-widget/html-reports/jest-report.html, \
                                            packages/server-extension/html-reports/int/jest-report.html, \
                                            packages/server-extension/html-reports/unit/jest-report.html""",
                reportTitles         : 'Widget, Server-Int, Server-Unit',
                reportName           : 'Test Reports'
            ])

            publishHTML(target: [
                allowMissing         : true,
                alwaysLinkToLastBuild: true,
                keepAll              : true,
                reportDir            : '.',
                reportFiles          : """packages/payment-widget/html-reports/coverage/index.html, \
                                        packages/server-extension/html-reports/int/coverage/index.html, \
                                        packages/server-extension/html-reports/unit/coverage/index.html""",
                reportTitles         : 'Widget, Server-Int, Server-Unit',
                reportName           : 'Code Coverage Reports'
            ])
            
            step([$class: 'Mailer', notifyEveryUnstableBuild: true, recipients: ''])
            notifySlack(this, "cybersource-jenkins", false)
        }
    }
}
