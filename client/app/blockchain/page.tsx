"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { jwtDecode } from "jwt-decode";
import { contractAddress, contractABI } from "./contract";

export default function BlockchainPage() {
  const router = useRouter();

  const [wallet, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ AUTH CHECK
  useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    router.push("/login");
    return;
  }

  try {
    const decoded: any = jwtDecode(token);
    const expiryTime = decoded.exp * 1000;
    const currentTime = Date.now();

    const timeLeft = expiryTime - currentTime;

    if (timeLeft <= 0) {
      localStorage.removeItem("token");
      router.push("/login");
      return;
    }

    // Auto logout exactly when it expires
    const timeout = setTimeout(() => {
      alert("Logging out now");
      localStorage.removeItem("token");
      router.push("/login");
    }, timeLeft);

    return () => clearTimeout(timeout);

  } catch {
    localStorage.removeItem("token");
    router.push("/login");
  }
}, []);


  const getContract = async () => {
    if (!window.ethereum) {
      alert("Install MetaMask");
      return null;
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    return new ethers.Contract(contractAddress, contractABI, signer);
  };

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    setWallet(address);
  };

  const clockIn = async () => {
    try {
      setLoading(true);
      const contract = await getContract();
      if (!contract) return;

      const tx = await contract.clockIn();
      await tx.wait();

      setStatus("Clocked In ✅");
    } catch (err) {
      console.error(err);
      setStatus("Clock In Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const clockOut = async () => {
    try {
      setLoading(true);
      const contract = await getContract();
      if (!contract) return;

      const tx = await contract.clockOut();
      await tx.wait();

      setStatus("Clocked Out ✅");
    } catch (err) {
      console.error(err);
      setStatus("Clock Out Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Attendance Blockchain</h1>

      <button style={styles.button} onClick={connectWallet}>
        Connect Wallet
      </button>

      {wallet && <p>Wallet: {wallet}</p>}

      <div style={{ marginTop: 30 }}>
        <button style={styles.green} onClick={clockIn} disabled={loading}>
          Clock In
        </button>

        <button style={styles.red} onClick={clockOut} disabled={loading}>
          Clock Out
        </button>
      </div>

      <p style={{ marginTop: 20 }}>{status}</p>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "white",
    padding: "60px",
    textAlign: "center" as const,
  },
  title: {
    fontSize: "32px",
    marginBottom: "20px",
  },
  button: {
    padding: "10px 20px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  green: {
    padding: "10px 20px",
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    marginRight: "15px",
    cursor: "pointer",
  },
  red: {
    padding: "10px 20px",
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
