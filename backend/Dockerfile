# ==================== Build Stage ====================
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build

# Use Aliyun Maven mirror for faster downloads in China
RUN mkdir -p /root/.m2 && cat > /root/.m2/settings.xml <<'XML'
<settings>
  <mirrors>
    <mirror>
      <id>aliyun</id>
      <mirrorOf>central</mirrorOf>
      <name>Aliyun Public Mirror</name>
      <url>https://maven.aliyun.com/repository/public</url>
    </mirror>
  </mirrors>
</settings>
XML

# Pre-download dependencies (cached layer)
COPY pom.xml .
RUN mvn -B -q dependency:go-offline -Dmaven.test.skip=true || true

# Build the application
COPY src ./src
RUN mvn -B clean package -DskipTests

# ==================== Runtime Stage ====================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN apk add --no-cache curl tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone

COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
