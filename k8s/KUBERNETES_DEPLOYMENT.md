# Kubernetes Deployment Guide - LoadBalancer Setup

## 📦 Files Created

- `backend-deployment.yaml` - Deployment configuration for your backend
- `backend-service-loadbalancer.yaml` - **LoadBalancer Service** to expose backend publicly
- `backend-secrets.yaml.template` - Template for environment variables

## 🚀 Deployment Steps

### Step 1: Create Kubernetes Secrets (First Time Only)

Copy the template and fill in your actual values:

```powershell
# Copy the template
Copy-Item k8s\backend-secrets.yaml.template k8s\backend-secrets.yaml

# Edit k8s/backend-secrets.yaml with your actual values from backend/.env
# Then apply it:
kubectl apply -f k8s/backend-secrets.yaml
```

**Or create secret directly from your .env file:**

```powershell
kubectl create secret generic backend-secrets --from-env-file=backend/.env
```

### Step 2: Apply the Updated Service (LoadBalancer)

```powershell
kubectl apply -f k8s/backend-service-loadbalancer.yaml
```

**Expected output:**
```
service/ead-backend-service configured
```

### Step 3: Apply the Deployment (if not already deployed)

```powershell
kubectl apply -f k8s/backend-deployment.yaml
```

**Expected output:**
```
deployment.apps/ead-backend configured
```

### Step 4: Check for External IP

```powershell
kubectl get service ead-backend-service -w
```

**Expected output (initially):**
```
NAME                  TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
ead-backend-service   LoadBalancer   10.96.123.45    <pending>     5000:32000/TCP   10s
```

**After a few minutes (cloud provider assigns IP):**
```
NAME                  TYPE           CLUSTER-IP      EXTERNAL-IP      PORT(S)          AGE
ead-backend-service   LoadBalancer   10.96.123.45    34.123.45.67     5000:32000/TCP   2m
```

Press `Ctrl+C` to stop watching once you see the EXTERNAL-IP.

### Step 5: Verify Public Access

Once the EXTERNAL-IP is assigned (e.g., `34.123.45.67`):

```powershell
# Test the health endpoint
curl http://34.123.45.67:5000/api/health

# Or in PowerShell:
Invoke-WebRequest -Uri http://34.123.45.67:5000/api/health
```

**Expected response:**
```json
{"status":"ok","message":"Server is running"}
```

## 📋 Complete Command Reference

### Initial Setup (Run Once)

```powershell
# Navigate to your project
cd C:\Users\somap\Documents\projects\EAD\EAD

# Create secrets from .env file
kubectl create secret generic backend-secrets --from-env-file=backend/.env

# Deploy the application
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service-loadbalancer.yaml
```

### Update Existing Deployment

```powershell
# If you already have NodePort service running, delete it first:
kubectl delete service ead-backend-service

# Apply the LoadBalancer service
kubectl apply -f k8s/backend-service-loadbalancer.yaml

# Verify
kubectl get service ead-backend-service
```

### Monitoring & Verification

```powershell
# Check service status (watch mode)
kubectl get service ead-backend-service -w

# Check service details
kubectl describe service ead-backend-service

# Check pods
kubectl get pods -l app=ead-backend

# Check pod logs
kubectl logs -l app=ead-backend --tail=50

# Follow logs in real-time
kubectl logs -l app=ead-backend -f
```

### Test Your Backend

```powershell
# Get the external IP
$EXTERNAL_IP = (kubectl get service ead-backend-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Test health endpoint
curl http://${EXTERNAL_IP}:5000/api/health

# Test in browser
Start-Process "http://${EXTERNAL_IP}:5000/api/health"
```

## 🔧 Troubleshooting

### External IP Stuck on `<pending>`

**Causes:**
1. **Local Kubernetes (Docker Desktop/Minikube):** LoadBalancer requires cloud provider
2. **Minikube:** Use `minikube tunnel` in a separate terminal
3. **Docker Desktop:** LoadBalancer becomes available on `localhost`

**Solutions:**

**For Minikube:**
```powershell
# In a separate terminal, run:
minikube tunnel

# Then check service again:
kubectl get service ead-backend-service
```

**For Docker Desktop:**
```powershell
# External IP will be 'localhost'
curl http://localhost:5000/api/health
```

**For Cloud Providers (GKE, EKS, AKS):**
- Wait 2-5 minutes for IP assignment
- Check cloud provider console for LoadBalancer status

### Pod Not Starting

```powershell
# Check pod status
kubectl get pods -l app=ead-backend

# Check pod details
kubectl describe pod -l app=ead-backend

# Check logs
kubectl logs -l app=ead-backend
```

### Service Not Routing Traffic

```powershell
# Verify endpoints
kubectl get endpoints ead-backend-service

# Should show pod IPs, if empty, check selector labels
kubectl get pods -l app=ead-backend --show-labels
```

## 🌐 Accessing Your Backend

Once deployed with external IP `34.123.45.67`:

- **Health Check:** `http://34.123.45.67:5000/api/health`
- **Auth Endpoint:** `http://34.123.45.67:5000/api/auth/login`
- **All APIs:** `http://34.123.45.67:5000/api/*`

Update your frontend to use this URL:
```javascript
const API_URL = 'http://34.123.45.67:5000/api';
```

## 📝 Important Notes

1. **Secrets:** Never commit `backend-secrets.yaml` with real values to Git!
2. **LoadBalancer Cost:** Cloud providers charge for LoadBalancer services
3. **Security:** Consider using HTTPS/TLS for production (requires Ingress)
4. **Environment:** Update `FRONTEND_URL` in secrets to match your frontend URL
5. **MongoDB:** Ensure MongoDB URI is accessible from Kubernetes cluster

## 🔄 Update Process

When you push a new Docker image:

```powershell
# 1. Build and push new image
docker build -t udythro/ead-backend:latest ./backend
docker push udythro/ead-backend:latest

# 2. Restart deployment to pull new image
kubectl rollout restart deployment ead-backend

# 3. Check rollout status
kubectl rollout status deployment ead-backend

# 4. Verify
kubectl get pods -l app=ead-backend
```

## 🎯 Next Steps

- [ ] Configure HTTPS using Kubernetes Ingress
- [ ] Set up horizontal pod autoscaling
- [ ] Configure persistent volumes for file storage
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Configure CI/CD pipeline for automated deployments
