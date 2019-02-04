# partially based on gradle docker:
# https://github.com/niaquinto/docker-gradle/blob/master/Dockerfile
# and partially based on android docker:
# https://github.com/gfx/docker-android-project/blob/master/Dockerfile

FROM openjdk:8-jdk
MAINTAINER Kathryn Killebrew <kkillebrew@azavea.com>

RUN apt-get update && apt-get install -yq apt-utils

# make pkg install non-interactive without disabling it for the whole container
RUN DEBIAN_FRONTEND=noninteractive && apt-get install -yq redis-tools python3-redis zip \
    ca-certificates ca-certificates-java haveged

# install gradle
ENV GRADLE_VERSION 2.14
#ENV GRADLE_VERSION 4.10.2
ENV GRADLE_HASH 993b4f33b652c689e9721917d8e021cab6bbd3eae81b39ab2fd46fdb19a928d5
WORKDIR /usr/lib
RUN wget https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip
#RUN echo "${GRADLE_HASH} gradle-${GRADLE_VERSION}-bin.zip" > gradle-${GRADLE_VERSION}-bin.zip.md5
#RUN sha256sum -c gradle-${GRADLE_VERSION}-bin.zip.md5
RUN unzip "gradle-${GRADLE_VERSION}-bin.zip"
RUN ln -s "/usr/lib/gradle-${GRADLE_VERSION}/bin/gradle" /usr/bin/gradle
RUN rm "gradle-${GRADLE_VERSION}-bin.zip"

# set up directory to mount
RUN mkdir -p /opt/app/data
VOLUME /opt/app/data

# set gradle environment
ENV GRADLE_HOME /usr/src/gradle
ENV PATH $PATH:$GRADLE_HOME/bin
ENV GRADLE_USER_HOME /opt/app/data
ENV GRADLE_OPTS '-Dorg.gradle.jvmargs="-Xmx1024m -XX:+HeapDumpOnOutOfMemoryError" -Dfile.encoding="UTF-8"'
ENV JAVA_OPTS "-Dfile.encoding='UTF-8'"
ENV TERM dumb

# Download and untar Android SDK
ENV ANDROID_BUILD_TOOLS_VERSION 23.0.2
ENV ANDROID_SDK_URL http://dl.google.com/android/android-sdk_r24.4.1-linux.tgz
ENV ANDROID_TOOLS_URL https://dl.google.com/android/repository/sdk-tools-linux-4333796.zip
RUN curl -L "${ANDROID_SDK_URL}" | tar --no-same-owner -xz -C /usr/local
RUN curl -L "${ANDROID_TOOLS_URL}" -o sdk-tools-linux.zip
ENV ANDROID_HOME /usr/local/android-sdk-linux
ENV ANDROID_SDK /usr/local/android-sdk-linux

RUN unzip -o sdk-tools-linux.zip -d ${ANDROID_HOME}
#android-sdk-linux
ENV PATH $PATH:${ANDROID_HOME}/tools/bin

# Install Android SDK components (dx.jar is in build tools)
ENV ANDROID_SDK_COMPONENTS build-tools-${ANDROID_BUILD_TOOLS_VERSION}
#RUN echo y | sdkmanager  "build-tools;${ANDROID_BUILD_TOOLS_VERSION}"

# get dx.jar
#RUN mv /usr/local/sdk-tools-linux/build-tools/${ANDROID_BUILD_TOOLS_VERSION}/lib/dx.jar /opt/app/
ENV DX_JAR_PATH /opt/app/dx.jar

# remove android components no longer needed (just need dx.jar)
#RUN rm -rf ${ANDROID_HOME}

# bake scripts into container
COPY build.gradle /opt/app/build.gradle
COPY run.sh /opt/app/run.sh
COPY sub.py /opt/app/sub.py

WORKDIR /opt/app

ENTRYPOINT ["python3", "sub.py"]