"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { jwtDecode } from "jwt-decode";
import { contractAddress, contractABI } from "./contract";

export default function BlockchainPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  // Check token and session expiration
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded: any = jwtDecode(token);

      // Only allow employees here
      if (decoded.role !== "employee") {
        router.push("/login");
        return;
      }

      const expiryTime = decoded.exp * 1000;
      const timeLeft = expiryTime - Date.now();
      if (timeLeft <= 0) {
        logout();
        return;
      }

      const timeout = setTimeout(() => {
        alert("Session expired.");
        logout();
      }, timeLeft);

      return () => clearTimeout(timeout);
    } catch {
      logout();
    }
  }, [router]);

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) return alert("Install MetaMask");

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (!accounts || accounts.length === 0) return alert("No wallet accounts found");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWallet(address);
      setStatus("Wallet connected ✅");
    } catch (err) {
      console.error(err);
      setStatus("Failed to connect wallet ❌");
    }
  };

  // Get contract instance
  const getContract = async () => {
    if (!window.ethereum) return null;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, contractABI, signer);
  };

  // Clock in
  const clockIn = async () => {
    if (!wallet) return alert("Connect your wallet first");
    setLoading(true);
    setStatus("");
    try {
      const contract = await getContract();
      if (!contract) return;
      const tx = await contract.clockIn(Math.floor(Date.now() / 1000));
      await tx.wait();
      setStatus("Clocked In ✅");
    } catch (err) {
      console.error(err);
      setStatus("Clock In Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  // Clock out
  const clockOut = async () => {
    if (!wallet) return alert("Connect your wallet first");
    setLoading(true);
    setStatus("");
    try {
      const contract = await getContract();
      if (!contract) return;
      const tx = await contract.clockOut(Math.floor(Date.now() / 1000));
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8 text-gray-800">
        <h1 className="text-3xl font-bold text-orange-500 mb-6 text-center">
          Attendance Blockchain
        </h1>

        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={connectWallet}
            className={`px-6 py-2 rounded-lg font-semibold text-white transition ${
              wallet ? "bg-green-500 hover:bg-green-600" : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {wallet ? "Wallet Connected" : "Connect Wallet"}
          </button>

          {wallet && <p className="text-gray-700">Wallet: {wallet}</p>}

          <div className="flex space-x-4 mt-4">
            <button
              onClick={clockIn}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
            >
              Clock In
            </button>

            <button
              onClick={clockOut}
              disabled={loading}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
            >
              Clock Out
            </button>
          </div>

          {status && <p className="mt-4 text-gray-700 font-medium">{status}</p>}

          <button
            onClick={logout}
            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
