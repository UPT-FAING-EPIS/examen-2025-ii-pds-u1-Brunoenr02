# ============================================================================
# DOCKERFILE PARA BACKEND - .NET 8 API
# ============================================================================

# Imagen base para runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000

# Imagen para build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar archivo de proyecto y restaurar dependencias
COPY ["BabysitterApi/BabysitterApi.csproj", "BabysitterApi/"]
RUN dotnet restore "BabysitterApi/BabysitterApi.csproj"

# Copiar código fuente
COPY . .
WORKDIR "/src/BabysitterApi"

# Compilar aplicación
RUN dotnet build "BabysitterApi.csproj" -c Release -o /app/build

# Publicar aplicación
FROM build AS publish
RUN dotnet publish "BabysitterApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Imagen final
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Variables de entorno por defecto
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ConnectionStrings__DefaultConnection=""
ENV JWT__SecretKey=""
ENV JWT__Issuer="BabysitterApi"
ENV JWT__Audience="BabysitterApp"

ENTRYPOINT ["dotnet", "BabysitterApi.dll"]